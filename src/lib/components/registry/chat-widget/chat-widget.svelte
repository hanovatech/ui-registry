<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { tick, untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { createAttachmentKey } from 'svelte/attachments';
	import BotIcon from '@lucide/svelte/icons/bot';
	import { t } from '$lib/stores/i18n';
	import ChatPanel from './chat-panel.svelte';

	// Floating chat for websites: a launcher in a bottom corner opens a
	// non-modal window over the page. The page stays scrollable and clickable
	// next to it — so an `aside`, not a dialog: no overlay, no focus trap.
	// Below `sm` the window fills the visible screen instead.
	type Props = Omit<
		ComponentProps<typeof ChatPanel>,
		'onClose' | 'autofocus' | 'class' | 'keyboardOpen'
	> & {
		open?: boolean;
		/** Window event that opens the chat, e.g. from a static header button. */
		openEvent?: string;
		/** Corner for the launcher and the window. */
		position?: 'bottom-right' | 'bottom-left';
		/** Window size in px until the visitor resizes it. */
		defaultWidth?: number;
		defaultHeight?: number;
		/** Limits for resizing, in px. */
		minWidth?: number;
		maxWidth?: number;
		minHeight?: number;
		/** Minimum room in px between the window and the top of the screen, e.g. for a sticky header. */
		topGap?: number;
		/**
		 * Classes for the launcher, e.g. `lg:hidden` when the header has its
		 * own. Added after `accentClass`.
		 */
		launcherClass?: string;
		/** Replaces the bot icon in the launcher. */
		launcherIcon?: Snippet;
		/** Hover scale and icon tilt on the default launcher. */
		launcherAnimated?: boolean;
		/**
		 * Renders the launcher yourself. Spread `props` on your button — they
		 * carry the click handler, labels and the ref used to return focus
		 * after closing. Placement in the corner stays with the widget.
		 */
		launcher?: Snippet<[{ props: Record<string | symbol, unknown> }]>;
		/**
		 * Classes for the floating window. They are appended, not merged: add
		 * new utilities freely, but overriding position, size or z-index is
		 * order-dependent — use `position`, the size props and `topGap` instead.
		 */
		class?: string;
		/** Classes for the panel inside the window. */
		panelClass?: string;
		launcherLabel?: string;
		resizeLabel?: string;
	};

	let {
		open = $bindable(false),
		messages = $bindable([]),
		consented = $bindable(),
		draft = $bindable(''),
		openEvent = 'chat-widget:open',
		position = 'bottom-right',
		defaultWidth = 384,
		defaultHeight = 560,
		minWidth = 320,
		maxWidth = 720,
		minHeight = 360,
		topGap = 72,
		storageKey = 'chat-widget',
		launcherClass,
		launcherIcon,
		launcherAnimated = true,
		launcher: launcherSnippet,
		class: className,
		panelClass,
		title,
		accentClass,
		launcherLabel = $t.common.chatOpen,
		resizeLabel = $t.common.chatResize,
		...panelProps
	}: Props = $props();

	/** Distance of the window from the bottom edge from `sm` up (`bottom-6`). */
	const BOTTOM_OFFSET = 24;

	const left = $derived(position === 'bottom-left');

	// Read while creating, not in an effect — otherwise the default size
	// flashes before the remembered one.
	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), Math.max(min, max));
	}

	// Stored values are checked: a broken entry would otherwise end up as an
	// invalid CSS width and collapse the window.
	function storedSize(): { width: number; height: number } {
		let stored: { width?: unknown; height?: unknown } = {};
		try {
			if (typeof localStorage !== 'undefined')
				stored = JSON.parse(localStorage.getItem(`${storageKey}:size`) ?? '{}') ?? {};
		} catch {
			// Unreadable — fall back to the defaults.
		}
		const number = (value: unknown, fallback: number) =>
			typeof value === 'number' && Number.isFinite(value) ? value : fallback;
		return {
			width: clamp(number(stored.width, defaultWidth), minWidth, maxWidth),
			height: Math.max(number(stored.height, defaultHeight), minHeight)
		};
	}

	const initialSize = storedSize();
	let width = $state(initialSize.width);
	let height = $state(initialSize.height);
	let launcher = $state<HTMLElement | null>(null);
	let panel = $state<ReturnType<typeof ChatPanel>>();
	let windowEl = $state<HTMLElement | null>(null);
	/** Where focus was when the chat opened, e.g. a header button. */
	let opener: HTMLElement | null = null;

	const launcherRef = createAttachmentKey();

	function attachLauncher(node: HTMLElement) {
		launcher = node;
		return () => (launcher = null);
	}

	const launcherProps = $derived({
		type: 'button' as const,
		'aria-label': launcherLabel,
		title: launcherLabel,
		onclick: () => (open = true),
		[launcherRef]: attachLauncher
	});
	let wasOpen = false;

	function resize(nextWidth: number, nextHeight: number) {
		width = clamp(nextWidth, minWidth, maxWidth);
		// Same limit as the CSS `min()` on the window, so a drag never shows
		// a size the window can't take.
		height = clamp(nextHeight, minHeight, window.innerHeight - topGap - BOTTOM_OFFSET);
		try {
			localStorage.setItem(`${storageKey}:size`, JSON.stringify({ width, height }));
		} catch {
			// Storage blocked: the size just isn't remembered.
		}
	}

	// The handle sits in the top corner away from the pinned one, so moving
	// up and away from that corner grows the window. Pointer capture keeps
	// the drag alive when the pointer leaves the handle.
	function onResizeStart(event: PointerEvent) {
		const handle = event.currentTarget as HTMLElement;
		const startX = event.clientX;
		const startY = event.clientY;
		const startWidth = width;
		const startHeight = height;
		const direction = left ? -1 : 1;
		handle.setPointerCapture(event.pointerId);
		event.preventDefault();

		const move = (e: PointerEvent) =>
			resize(startWidth + direction * (startX - e.clientX), startHeight + startY - e.clientY);
		const end = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', end);
			handle.removeEventListener('pointercancel', end);
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', end);
		handle.addEventListener('pointercancel', end);
	}

	// A drag-only handle would shut out keyboard users.
	function onResizeKey(event: KeyboardEvent) {
		const step = event.shiftKey ? 64 : 16;
		const grow = left ? 'ArrowRight' : 'ArrowLeft';
		const shrink = left ? 'ArrowLeft' : 'ArrowRight';
		if (event.key === grow) resize(width + step, height);
		else if (event.key === shrink) resize(width - step, height);
		else if (event.key === 'ArrowUp') resize(width, height + step);
		else if (event.key === 'ArrowDown') resize(width, height - step);
		else return;
		event.preventDefault();
	}

	// Escape closes even when focus is on the page — the window isn't modal,
	// so focus can be anywhere.
	function onWindowKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && !event.defaultPrevented) open = false;
	}

	/**
	 * Opens the chat and sends a question as if the visitor had typed it — e.g.
	 * from a "ask about this" link elsewhere on the page.
	 */
	export async function ask(text: string) {
		open = true;
		await tick();
		panel?.ask(text);
	}

	// Into the panel on every open — also when it reopens during the closing
	// transition, which reverses it instead of mounting a fresh panel.
	//
	// After closing, back to whatever opened it (a header button, say), else
	// to the launcher — or keyboard users restart at the top of the page. Only
	// if focus was in the chat: someone who clicked into the page and then
	// pressed Escape keeps their place.
	$effect(() => {
		const isOpen = open;
		untrack(() => {
			const active = document.activeElement;
			if (isOpen) {
				if (!wasOpen) {
					opener =
						active instanceof HTMLElement && active !== document.body && !windowEl?.contains(active)
							? active
							: null;
				}
				wasOpen = true;
				tick().then(() => panel?.focus());
			} else if (wasOpen) {
				wasOpen = false;
				if (active && active !== document.body && !windowEl?.contains(active)) return;
				tick().then(() => {
					const visible = opener?.isConnected && opener.checkVisibility?.() !== false;
					(visible ? opener : launcher)?.focus();
					opener = null;
				});
			}
		});
	});

	$effect(() => {
		const show = () => (open = true);
		window.addEventListener(openEvent, show);
		return () => window.removeEventListener(openEvent, show);
	});

	// Below `sm` the window fills the screen — the VISIBLE one. A fixed element
	// sizes to the layout viewport, which the iOS keyboard leaves unchanged, so
	// the input would slide behind the keyboard. `visualViewport` is what is
	// actually on screen; its height and offset go to the window as CSS
	// variables. The page behind is locked meanwhile: nobody can see it, and it
	// shouldn't scroll along when swiping the thread.
	let viewport = $state<{ height: number; top: number; keyboard: boolean } | null>(null);
	const fullscreen = $derived(viewport !== null);

	/** The on-screen keyboard shrinks the visible viewport by far more than Safari's bars do. */
	const KEYBOARD_THRESHOLD = 150;

	$effect(() => {
		if (!open) return;

		const mobile = window.matchMedia('(width < 40rem)');
		const vv = window.visualViewport;
		const root = document.documentElement;
		let locked = false;
		let previousRoot = '';
		let previousBody = '';

		function lock(on: boolean) {
			if (on === locked) return;
			locked = on;
			// Safari on iOS honours `overflow` on <body>, other browsers on <html>.
			if (on) {
				previousRoot = root.style.overflow;
				previousBody = document.body.style.overflow;
				root.style.overflow = 'hidden';
				document.body.style.overflow = 'hidden';
			} else {
				root.style.overflow = previousRoot;
				document.body.style.overflow = previousBody;
			}
		}

		function measure() {
			viewport =
				mobile.matches && vv
					? {
							height: vv.height,
							top: vv.offsetTop,
							// Screen points (`* scale`), so zooming in doesn't count as a keyboard.
							keyboard: root.clientHeight - vv.height * vv.scale > KEYBOARD_THRESHOLD
						}
					: null;
			lock(mobile.matches);
		}

		measure();
		vv?.addEventListener('resize', measure);
		vv?.addEventListener('scroll', measure);
		mobile.addEventListener('change', measure);

		return () => {
			vv?.removeEventListener('resize', measure);
			vv?.removeEventListener('scroll', measure);
			mobile.removeEventListener('change', measure);
			lock(false);
			viewport = null;
		};
	});

	// Full screen on phones, the page behind is out of sight — so it leaves the
	// tab order and the accessibility tree too. From `sm` up the window stays
	// non-modal and nothing is made inert.
	$effect(() => {
		if (!fullscreen || !windowEl) return;
		const changed: HTMLElement[] = [];
		for (let el: HTMLElement | null = windowEl; el && el !== document.body; el = el.parentElement) {
			for (const sibling of el.parentElement?.children ?? []) {
				if (sibling !== el && sibling instanceof HTMLElement && !sibling.inert) {
					sibling.inert = true;
					changed.push(sibling);
				}
			}
		}
		return () => changed.forEach((el) => (el.inert = false));
	});

	function enter(node: Element) {
		return fly(node, { y: 24, duration: prefersReducedMotion.current ? 0 : 200 });
	}
</script>

<svelte:window onkeydown={onWindowKey} />

{#if !open}
	{@const corner = [
		// `safe-area-inset-bottom` keeps it above the iOS home indicator,
		// where it would sit in the swipe area and be hard to hit.
		'fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 sm:bottom-6',
		left ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
	]}
	{#if launcherSnippet}
		<div class={[corner, launcherClass]}>
			{@render launcherSnippet({ props: launcherProps })}
		</div>
	{:else}
		<button
			{...launcherProps}
			class={[
				corner,
				'group flex size-14 items-center justify-center rounded-full shadow-lg ring-2 ring-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
				launcherAnimated && 'transition-transform hover:scale-105',
				accentClass ?? 'bg-primary text-primary-foreground',
				launcherClass
			]}
		>
			{#if launcherIcon}
				{@render launcherIcon()}
			{:else}
				<BotIcon
					class={[
						'size-7',
						launcherAnimated && 'transition-transform duration-200 motion-safe:group-hover:-rotate-12'
					]}
				/>
			{/if}
		</button>
	{/if}
{/if}

{#if open}
	<aside
		bind:this={windowEl}
		aria-label={title}
		transition:enter
		style:--chat-width="{width}px"
		style:--chat-height="{height}px"
		style:--chat-top-gap="{topGap}px"
		style:--chat-vv-height={viewport ? `${viewport.height}px` : undefined}
		style:--chat-vv-top={viewport ? `${viewport.top}px` : undefined}
		class={[
			'fixed inset-x-0 top-(--chat-vv-top,0) z-50 flex h-(--chat-vv-height,100dvh) w-full flex-col overflow-hidden bg-background sm:inset-auto sm:bottom-6 sm:h-[min(var(--chat-height),calc(100dvh-var(--chat-top-gap)-1.5rem))] sm:w-[min(var(--chat-width),calc(100vw-3rem))] sm:rounded-xl sm:border sm:shadow-xl',
			left ? 'sm:left-6' : 'sm:right-6',
			className
		]}
	>
		<!-- Drag it, or focus it and use the arrow keys (Shift for bigger
		     steps). 24px for a comfortable target (WCAG 2.5.8). Only from `sm`:
		     on phones the window fills the screen. -->
		<button
			type="button"
			aria-label={resizeLabel}
			title={resizeLabel}
			onpointerdown={onResizeStart}
			onkeydown={onResizeKey}
			class={[
				'absolute top-0 z-10 hidden size-6 touch-none outline-none focus-visible:bg-ring/30 sm:block',
				left ? 'right-0 cursor-nesw-resize rounded-tr-xl' : 'left-0 cursor-nwse-resize rounded-tl-xl'
			]}
		></button>
		<ChatPanel
			bind:this={panel}
			{...panelProps}
			bind:messages
			bind:consented
			bind:draft
			keyboardOpen={viewport?.keyboard ?? false}
			{title}
			{storageKey}
			{accentClass}
			class={panelClass}
			onClose={() => (open = false)}
		/>
	</aside>
{/if}
