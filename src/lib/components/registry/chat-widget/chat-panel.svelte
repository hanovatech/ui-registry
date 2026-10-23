<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import BotIcon from '@lucide/svelte/icons/bot';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SquareIcon from '@lucide/svelte/icons/square';
	import XIcon from '@lucide/svelte/icons/x';
	import * as Bubble from '$lib/components/ui/bubble/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Marker from '$lib/components/ui/marker/index.js';
	import * as Message from '$lib/components/ui/message/index.js';
	import * as MessageScroller from '$lib/components/ui/message-scroller/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { t } from '$lib/stores/i18n';
	import type { BubbleVariant } from '$lib/components/ui/bubble/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		ChatError,
		chatId,
		type ChatConsentPersistence,
		type ChatLinkify,
		type ChatMessage,
		type ChatProvider,
		type ChatTransport
	} from './chat.js';

	// The conversation itself: header, consent gate, thread and prompt input.
	// Fills its parent, so it works embedded in a page as well as inside
	// `ChatWidget`'s floating window.
	interface Props {
		/** Streams the assistant's reply. See `createSseTransport()`. */
		transport: ChatTransport;
		/** Assistant name shown in the header. */
		title: string;
		/** Shown under the title while no reply is streaming. */
		subtitle?: string;
		/** The conversation. Bind it to keep or restore a thread. */
		messages?: ChatMessage[];
		/** The unsent input. Bind it to keep a draft across remounts. */
		draft?: string;
		/** One-click prompts shown until the first message. */
		suggestions?: string[];
		/** Visitor messages per conversation; the input closes after that. */
		maxTurns?: number;
		maxLength?: number;
		placeholder?: string;
		/** Prefix for the consent flag in `sessionStorage`. */
		storageKey?: string;
		/** Splits replies into text and links. Replies are never rendered as HTML. */
		linkify?: ChatLinkify;
		/** Focus the next step (consent button or input) when mounted. */
		autofocus?: boolean;
		/** Shows a close button in the header. */
		onClose?: () => void;
		/** Called with each visitor message as it is sent. */
		onSend?: (message: ChatMessage) => void;
		/** Called with each reply once it has streamed completely. */
		onReply?: (message: ChatMessage) => void;
		/** Called with whatever made a reply fail (also logged unless it is a `ChatError`). */
		onError?: (error: unknown) => void;
		/** Drops the bottom safe-area padding while the on-screen keyboard is open (set by `ChatWidget`). */
		keyboardOpen?: boolean;
		/** Replaces the bot icon in the header. */
		avatar?: Snippet;
		/** Shown next to every assistant reply, e.g. a small avatar. */
		assistantAvatar?: Snippet;
		/** Extra buttons in the header, before reset and close. */
		headerActions?: Snippet;
		/** Empty state above the suggestions. */
		intro?: Snippet;
		/**
		 * Gates the chat behind a consent step: who answers (`provider`), where
		 * messages go, a privacy link and a way out without AI. The input only
		 * exists after the visitor agrees, so nothing leaves the browser before.
		 */
		requireConsent?: boolean;
		/** Whether the visitor agreed. Bind it to sync with a consent manager. */
		consented?: boolean;
		/** Where agreement is remembered. `session` lasts until the tab closes. */
		consentPersistence?: ChatConsentPersistence;
		/** Called when the visitor agrees. */
		onConsent?: () => void;
		/** Who answers. Shown in the consent step and above an empty conversation. */
		provider?: ChatProvider;
		/** Show the provider above an empty conversation too. */
		showProvider?: boolean;
		/** Linked from the consent step. */
		privacyUrl?: string;
		/** Offered in the consent step as the way out without AI. */
		contactUrl?: string;
		/** Replaces the notice text in the consent step (and turns the step on). */
		consent?: Snippet;
		/** Replaces the way out below the consent button. */
		consentFooter?: Snippet;
		/** Replaces the provider row (label, logo, model badge). */
		providerInfo?: Snippet;
		/**
		 * Replaces the whole consent step. Call `accept` from your own button;
		 * storage, focus and the gate in front of the input stay with the panel.
		 */
		consentScreen?: Snippet<[{ accept: () => void; provider?: ChatProvider; notice: string }]>;
		/** Replaces the consent step's default padding, spacing and typography. */
		consentClass?: string;
		consentButtonClass?: string;
		/** Replaces the label shown once `maxTurns` is reached. */
		limitReached?: Snippet;
		/**
		 * Renders a whole message row yourself. `text` renders content with
		 * `linkify` applied; `streaming` is true while this reply grows.
		 */
		renderMessage?: Snippet<
			[{ message: ChatMessage; streaming: boolean; text: Snippet<[string]> }]
		>;
		/** Replaces the spinner row shown before the first chunk arrives. */
		typing?: Snippet;
		sendIcon?: Snippet;
		stopIcon?: Snippet;
		resetIcon?: Snippet;
		retryIcon?: Snippet;
		closeIcon?: Snippet;
		/**
		 * Classes for every accent surface — header avatar, send button and
		 * visitor bubble — in place of `bg-primary`. Takes gradients too, e.g.
		 * `bg-linear-to-br from-violet-600 to-blue-600 text-white`.
		 */
		accentClass?: string;
		/** Overrides `accentClass` for the header avatar. */
		avatarClass?: string;
		/** Overrides `accentClass` for the send button. */
		sendButtonClass?: string;
		/** Overrides `accentClass` (and `userVariant`) for visitor bubbles. */
		userBubbleClass?: string;
		/** Overrides `assistantVariant` for reply bubbles. */
		assistantBubbleClass?: string;
		userVariant?: BubbleVariant;
		assistantVariant?: BubbleVariant;
		suggestionClass?: string;
		class?: string;
		/** A coloured header works too: title, status and buttons follow its text colour. */
		headerClass?: string;
		closeLabel?: string;
		resetLabel?: string;
		typingLabel?: string;
		inputLabel?: string;
		sendLabel?: string;
		stopLabel?: string;
		retryLabel?: string;
		scrollToEndLabel?: string;
		consentLabel?: string;
		consentFromLabel?: string;
		/** `{provider}` is replaced with the provider's name and location. */
		consentNoticeLabel?: string;
		privacyLabel?: string;
		alternativeLabel?: string;
		contactLabel?: string;
		errorLabel?: string;
		limitLabel?: string;
	}

	let {
		transport,
		title,
		subtitle,
		messages = $bindable([]),
		draft = $bindable(''),
		suggestions = [],
		maxTurns = Infinity,
		maxLength = 2000,
		placeholder = $t.common.chatPlaceholder,
		storageKey = 'chat-widget',
		linkify = (text) => [{ type: 'text', value: text }],
		autofocus = false,
		onClose,
		onSend,
		onReply,
		onError,
		keyboardOpen = false,
		avatar,
		assistantAvatar,
		headerActions,
		intro,
		requireConsent = false,
		consentPersistence = 'session',
		consented = $bindable(),
		onConsent,
		provider,
		showProvider = true,
		privacyUrl,
		contactUrl,
		consent,
		consentFooter,
		providerInfo,
		consentScreen,
		consentClass,
		consentButtonClass,
		limitReached,
		renderMessage,
		typing,
		sendIcon,
		stopIcon,
		resetIcon,
		retryIcon,
		closeIcon,
		accentClass,
		avatarClass,
		sendButtonClass,
		userBubbleClass,
		assistantBubbleClass,
		userVariant = 'default',
		assistantVariant = 'muted',
		suggestionClass,
		class: className,
		headerClass,
		closeLabel = $t.common.chatClose,
		resetLabel = $t.common.chatReset,
		typingLabel = $t.common.chatTyping,
		inputLabel = $t.common.chatInputLabel,
		sendLabel = $t.common.chatSend,
		stopLabel = $t.common.chatStop,
		retryLabel = $t.common.chatRetry,
		scrollToEndLabel = $t.common.chatScrollToEnd,
		consentLabel = $t.common.chatConsentAccept,
		consentFromLabel = $t.common.chatConsentFrom,
		consentNoticeLabel = $t.common.chatConsentNotice,
		privacyLabel = $t.common.chatConsentPrivacy,
		alternativeLabel = $t.common.chatConsentAlternative,
		contactLabel = $t.common.chatConsentContact,
		errorLabel = $t.common.chatError,
		limitLabel = $t.common.chatLimitReached
	}: Props = $props();

	// Session by default: a consent that outlives the visit is a consent
	// record, and that belongs in the site's consent manager, where it can be
	// withdrawn — bind `consented` to wire it up there instead.
	function consentStorage(): Storage | null {
		if (consentPersistence === 'none' || typeof window === 'undefined') return null;
		try {
			return consentPersistence === 'local' ? localStorage : sessionStorage;
		} catch {
			return null;
		}
	}

	// Read while creating the component, not in an effect — otherwise the gate
	// flashes on every open although the visitor already agreed.
	function storedConsent(): boolean {
		try {
			return consentStorage()?.getItem(`${storageKey}:consent`) === '1';
		} catch {
			return false;
		}
	}

	// The bound value wins when given (e.g. from a consent manager); otherwise
	// what this browser remembered.
	let accepted = $state(storedConsent());
	const gated = $derived((requireConsent || !!consent || !!consentScreen) && !(consented ?? accepted));
	const providerText = $derived(
		provider
			? provider.location
				? `${provider.name} (${provider.location})`
				: provider.name
			: $t.common.chatConsentProviderFallback
	);
	const consentNotice = $derived(consentNoticeLabel.replace('{provider}', providerText));

	let busy = $state(false);
	let error = $state<string | null>(null);
	let root = $state<HTMLElement | null>(null);
	let gate = $state<HTMLElement | null>(null);
	let form = $state<HTMLFormElement | null>(null);
	let input = $state<HTMLTextAreaElement | null>(null);
	let consentButton = $state<HTMLButtonElement | null>(null);
	let resetButton = $state<HTMLButtonElement | null>(null);
	let controller: AbortController | undefined;

	const turns = $derived(messages.filter((m) => m.role === 'user').length);
	const limitHit = $derived(turns >= maxTurns);
	const canSend = $derived(draft.trim().length > 0 && !busy && !limitHit && !gated);
	const lastId = $derived(messages.at(-1)?.id);
	// A question without an answer — after an error, Stop before the first
	// word, or a reply cut off by closing the window.
	const unanswered = $derived(!busy && messages.at(-1)?.role === 'user');

	// Header buttons take the header's text colour, so a coloured header
	// doesn't end up with dark icons and a grey hover.
	const headerButtonClass =
		'text-current hover:bg-current/10 hover:text-current dark:hover:bg-current/10';

	function accept() {
		accepted = true;
		consented = true;
		try {
			consentStorage()?.setItem(`${storageKey}:consent`, '1');
		} catch {
			// Private mode or blocked storage: consent then lasts for this page only.
		}
		onConsent?.();
		tick().then(() => input?.focus());
	}

	// Keeps keyboard users in the panel when the focused control goes away: a
	// suggestion unmounts, send turns into stop and back, the input gets
	// disabled at the turn limit. Focus elsewhere on the page is left alone.
	function refocus() {
		tick().then(() => {
			if (!root?.isConnected) return;
			const active = document.activeElement as (HTMLElement & { disabled?: boolean }) | null;
			const lost = !active || active === document.body || (root.contains(active) && active.disabled);
			if (lost) (limitHit ? resetButton : input)?.focus();
		});
	}

	function fail(e: unknown) {
		// Only a `ChatError` speaks to the visitor; "Failed to fetch" or a
		// TypeError would be raw, untranslated noise in the thread.
		if (e instanceof ChatError && e.message) {
			error = e.message;
		} else {
			error = errorLabel;
			console.error('[chat]', e);
		}
		onError?.(e);
	}

	async function send(text: string) {
		const content = text.trim();
		if (!content || busy || limitHit || gated) return;

		error = null;
		draft = '';
		const question: ChatMessage = { id: chatId(), role: 'user', content, createdAt: Date.now() };
		messages = [...messages, question];
		const history = messages.map((m) => ({ ...m }));
		onSend?.(question);

		// The reply streams into a placeholder that is replaced per chunk, so
		// a plain (non-$state) bound array stays reactive too.
		const reply: ChatMessage = { id: chatId(), role: 'assistant', content: '', createdAt: Date.now() };
		messages = [...messages, reply];

		controller?.abort();
		const current = new AbortController();
		controller = current;
		busy = true;
		refocus();

		try {
			for await (const chunk of transport(history, { signal: current.signal })) {
				if (current.signal.aborted) break;
				reply.content += chunk;
				messages = messages.map((m) => (m.id === reply.id ? { ...reply } : m));
			}
			if (!current.signal.aborted) {
				// A reply that ends without a word is a failure too, or the
				// question would just sit there unanswered.
				if (reply.content) onReply?.({ ...reply });
				else fail(new Error('Reply ended without text'));
			}
		} catch (e) {
			if (!current.signal.aborted) fail(e);
		} finally {
			if (controller === current) {
				busy = false;
				controller = undefined;
				refocus();
			}
			// No empty bubble for a reply that never started.
			if (!reply.content) messages = messages.filter((m) => m.id !== reply.id);
		}
	}

	function stop() {
		// Free the input right away instead of when the aborted stream winds
		// down — an Enter straight after Stop would be swallowed otherwise.
		controller?.abort();
		controller = undefined;
		busy = false;
		// Same for a reply that hadn't started: no empty bubble in the meantime.
		const last = messages.at(-1);
		if (last?.role === 'assistant' && !last.content) messages = messages.slice(0, -1);
		refocus();
	}

	function retry() {
		const last = messages.at(-1);
		if (last?.role !== 'user') return;
		messages = messages.slice(0, -1);
		send(last.content);
	}

	function reset() {
		stop();
		messages = [];
		error = null;
		draft = '';
		tick().then(() => input?.focus());
	}

	function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (canSend) send(draft);
	}

	function onKeydown(event: KeyboardEvent) {
		// Enter sends, Shift+Enter adds a line. Not while an IME is composing.
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			form?.requestSubmit();
		}
	}

	// Closing the panel unmounts it — stop paying for tokens nobody reads.
	$effect(() => () => controller?.abort());

	/** Focuses the next step: the consent button, or the input after it. */
	export function focus() {
		if (!gated) return input?.focus();
		const target =
			consentButton ??
			gate?.querySelector<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
		target?.focus();
	}

	$effect(() => {
		if (autofocus) focus();
	});

	function enter(node: Element) {
		return fly(node, { y: 8, duration: prefersReducedMotion.current ? 0 : 200 });
	}
</script>

{#snippet text(content: string)}
	{#each linkify(content) as segment, i (i)}
		{#if segment.type === 'link'}
			<a
				href={segment.href}
				class="font-medium underline underline-offset-2"
				{...segment.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
				>{segment.value}</a
			>
		{:else}{segment.value}{/if}
	{/each}
{/snippet}

{#snippet bubble(message: ChatMessage)}
	{@const user = message.role === 'user'}
	{@const custom = user ? (userBubbleClass ?? accentClass) : assistantBubbleClass}
	<Bubble.Root align={user ? 'end' : 'start'} variant={user ? userVariant : assistantVariant}>
		{#if custom}
			<Bubble.Content>
				{#snippet child({ props })}
					<!-- Own slot name: the variant colours target `bubble-content`
					     through the parent, a selector no class here could beat. -->
					<div
						{...props}
						data-slot="chat-bubble-content"
						class={[props.class as string, 'whitespace-pre-wrap', custom]}
					>
						{#if user}{message.content}{:else}{@render text(message.content)}{/if}
					</div>
				{/snippet}
			</Bubble.Content>
		{:else}
			<Bubble.Content class="whitespace-pre-wrap">
				{#if user}{message.content}{:else}{@render text(message.content)}{/if}
			</Bubble.Content>
		{/if}
	</Bubble.Root>
{/snippet}

{#snippet providerRow()}
	{#if providerInfo}
		{@render providerInfo()}
	{:else if provider}
		<!-- Label above the value, like a data row: next to each other the
		     sentence reads as if it belonged to the logo. -->
		<div class="space-y-1.5">
			<p class="text-xs text-muted-foreground">{consentFromLabel}</p>
			<div class="flex flex-wrap items-center gap-2">
				{#if provider.logo}
					<img src={provider.logo} alt={provider.name} class="h-5 w-auto" />
				{:else}
					<span class="text-sm font-semibold text-foreground">{provider.name}</span>
				{/if}
				{#if provider.model}
					<Badge variant="outline" class="font-mono">{provider.model}</Badge>
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

<div bind:this={root} data-slot="chat-panel" class={['flex size-full min-h-0 flex-col bg-background', className]}>
	<div class={['flex shrink-0 items-center gap-3 border-b px-4 py-3', headerClass]}>
		<div
			class={[
				'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full',
				avatarClass ?? accentClass ?? 'bg-primary text-primary-foreground'
			]}
			aria-hidden="true"
		>
			{#if avatar}
				{@render avatar()}
			{:else}
				<BotIcon class="size-5" />
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-semibold">{title}</p>
			{#if busy || subtitle}
				<p class="flex items-center gap-1.5 truncate text-xs opacity-70">
					<span
						class={[
							'size-1.5 shrink-0 rounded-full bg-emerald-500',
							!busy && 'motion-safe:animate-pulse'
						]}
						aria-hidden="true"
					></span>
					{busy ? typingLabel : subtitle}
				</p>
			{/if}
		</div>
		{@render headerActions?.()}
		{#if messages.length > 0 && !gated}
			<Button
				bind:ref={resetButton}
				variant="ghost"
				size="icon-sm"
				class={headerButtonClass}
				onclick={reset}
				aria-label={resetLabel}
				title={resetLabel}
			>
				{#if resetIcon}{@render resetIcon()}{:else}<RotateCcwIcon />{/if}
			</Button>
		{/if}
		{#if onClose}
			<Button
				variant="ghost"
				size="icon-sm"
				class={headerButtonClass}
				onclick={onClose}
				aria-label={closeLabel}
				title={closeLabel}
			>
				{#if closeIcon}{@render closeIcon()}{:else}<XIcon />{/if}
			</Button>
		{/if}
	</div>

	{#if gated}
		<!-- A gate, not a dismissible notice: without the button there is no
		     input, and without an input nothing leaves the browser. -->
		<div
			bind:this={gate}
			class={[
				'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain',
				consentClass ??
					'gap-4 p-4 text-sm text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2'
			]}
		>
			{#if consentScreen}
				{@render consentScreen({ accept, provider, notice: consentNotice })}
			{:else}
				{@render providerRow()}
				<div class="space-y-3">
					{#if consent}
						{@render consent()}
					{:else}
						<p>{consentNotice}</p>
					{/if}
					{#if privacyUrl}
						<p><a href={privacyUrl}>{privacyLabel}</a></p>
					{/if}
				</div>
				<Button bind:ref={consentButton} class={['mt-1 w-full', consentButtonClass]} onclick={accept}>
					{consentLabel}
				</Button>
				<!-- The way out for anyone who wants no AI at all — here, not behind
				     the consent, so declining doesn't leave a dead end. -->
				{#if consentFooter || contactUrl}
					<div class="mt-auto pt-4 text-xs">
						{#if consentFooter}
							{@render consentFooter()}
						{:else}
							<p>{alternativeLabel} <a href={contactUrl}>{contactLabel}</a></p>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	{:else}
		<MessageScroller.Provider autoScroll>
			<div class="relative min-h-0 flex-1">
				{#if messages.length === 0}
					<div class="flex h-full flex-col justify-end gap-3 overflow-y-auto overscroll-contain p-4 text-sm text-muted-foreground">
						{#if showProvider}
							<div class="mb-auto">{@render providerRow()}</div>
						{/if}
						{@render intro?.()}
					</div>
				{:else}
					<MessageScroller.Root>
						<MessageScroller.Viewport aria-label={title}>
							<MessageScroller.Content aria-busy={busy} class="gap-4 p-4">
								{#each messages as message (message.id)}
									{@const streaming = busy && message.id === lastId}
									<MessageScroller.Item messageId={message.id} scrollAnchor={message.role === 'user'}>
										<div in:enter>
											{#if message.content === '' && streaming}
												{#if typing}
													{@render typing()}
												{:else}
													<Marker.Root role="status">
														<Marker.Icon><Spinner role="presentation" aria-label={typingLabel} /></Marker.Icon>
														<Marker.Content>{typingLabel}</Marker.Content>
													</Marker.Root>
												{/if}
											{:else if renderMessage}
												{@render renderMessage({ message, streaming, text })}
											{:else}
												<Message.Root align={message.role === 'user' ? 'end' : 'start'}>
													{#if message.role === 'assistant' && assistantAvatar}
														<Message.Avatar>{@render assistantAvatar()}</Message.Avatar>
													{/if}
													<Message.Content>
														{@render bubble(message)}
													</Message.Content>
												</Message.Root>
											{/if}
										</div>
									</MessageScroller.Item>
								{/each}

								{#if error || unanswered}
									<MessageScroller.Item messageId="chat-error">
										<Message.Root>
											<Message.Content>
												{#if error}
													<Bubble.Root variant="destructive" role="alert">
														<Bubble.Content>{error}</Bubble.Content>
													</Bubble.Root>
												{/if}
												{#if unanswered}
													<Message.Footer class="px-0">
														<Button variant="outline" size="sm" onclick={retry}>
															{#if retryIcon}{@render retryIcon()}{:else}<RotateCcwIcon />{/if}
															{retryLabel}
														</Button>
													</Message.Footer>
												{/if}
											</Message.Content>
										</Message.Root>
									</MessageScroller.Item>
								{/if}

								{#if limitHit && !busy}
									<MessageScroller.Item messageId="chat-limit">
										<Marker.Root variant="separator">
											<Marker.Content>
												{#if limitReached}{@render limitReached()}{:else}{limitLabel}{/if}
											</Marker.Content>
										</Marker.Root>
									</MessageScroller.Item>
								{/if}
							</MessageScroller.Content>
						</MessageScroller.Viewport>
						<MessageScroller.Button>
							<ArrowDownIcon />
							<span class="sr-only">{scrollToEndLabel}</span>
						</MessageScroller.Button>
					</MessageScroller.Root>
				{/if}
			</div>
		</MessageScroller.Provider>

		<!-- Clear of the home indicator on phones — unless the keyboard is
		     open, which covers it; then the input sits right above the keys. -->
		<div
			class={[
				'flex shrink-0 flex-col gap-2 p-3',
				!keyboardOpen && 'pb-[max(--spacing(3),env(safe-area-inset-bottom))] sm:pb-3'
			]}
		>
			{#if messages.length === 0 && suggestions.length > 0}
				<div class="flex scroll-fade-x scrollbar-none gap-2 overflow-x-auto overscroll-x-contain">
					{#each suggestions as suggestion, i (i)}
						<Button
							variant="outline"
							size="sm"
							class={['shrink-0', suggestionClass]}
							onclick={() => send(suggestion)}
						>
							{suggestion}
						</Button>
					{/each}
				</div>
			{/if}
			<form bind:this={form} onsubmit={onSubmit}>
				<!-- Input Group greys out for any disabled child; here only a
				     disabled textarea should, not the idle send button. -->
				<InputGroup.Root
					class="has-disabled:bg-transparent has-disabled:opacity-100 has-[textarea:disabled]:bg-input/50 has-[textarea:disabled]:opacity-50"
				>
					<InputGroup.Textarea
						bind:ref={input}
						bind:value={draft}
						{placeholder}
						aria-label={inputLabel}
						maxlength={maxLength}
						disabled={limitHit}
						rows={1}
						onkeydown={onKeydown}
						class="max-h-32 min-h-11 px-3"
					/>
					<InputGroup.Addon align="block-end">
						{#if busy}
							<InputGroup.Button
								type="button"
								size="icon-sm"
								variant="outline"
								class="ml-auto rounded-full"
								aria-label={stopLabel}
								onclick={stop}
							>
								{#if stopIcon}{@render stopIcon()}{:else}<SquareIcon class="fill-current" />{/if}
							</InputGroup.Button>
						{:else}
							<InputGroup.Button
								type="submit"
								size="icon-sm"
								variant="default"
								class={['ml-auto rounded-full', sendButtonClass ?? accentClass]}
								aria-label={sendLabel}
								disabled={!canSend}
							>
								{#if sendIcon}{@render sendIcon()}{:else}<ArrowUpIcon />{/if}
							</InputGroup.Button>
						{/if}
					</InputGroup.Addon>
				</InputGroup.Root>
			</form>
		</div>
	{/if}
</div>
