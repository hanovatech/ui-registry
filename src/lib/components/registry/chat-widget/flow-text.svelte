<script lang="ts">
	import { untrack } from 'svelte';

	// Shows a reply's HTML and uncovers every newly arrived word from left to
	// right — its start first, the rest following — so a streaming answer flows
	// from word to word instead of ticking in. The HTML is rebuilt on every
	// change; words keep their scheduled time, so a word mid-reveal continues
	// where it was instead of starting over, and words fully in stay plain text.
	// The word spans are added in a detached template, never in the live DOM.
	interface Props {
		/** Sanitized HTML — the caller's responsibility, as with any `{@html}`. */
		html: string;
		/** Uncover new words. Read once: a reply shown finished never animates. */
		animate: boolean;
		class?: string;
	}

	let { html, animate, class: className }: Props = $props();

	// A fresh word waits briefly before it is uncovered, so the bubble around it
	// has made room first.
	const LEAD_MS = 80;

	// Words are uncovered one after another like a cursor running through the
	// text at an even speed per letter — not each the moment it arrives, which
	// follows the stream's uneven rhythm. A word starts once the one before is
	// three quarters in, so the soft edges run into each other.
	const MS_PER_CHAR = 24;
	const MIN_REVEAL_MS = 160;
	const OVERLAP = 0.25;

	function revealMs(word: string): number {
		return Math.max(MIN_REVEAL_MS, (word.length + 1) * MS_PER_CHAR);
	}

	const animated = untrack(() => animate);
	// When each word (by its position in the text) starts and how long it takes.
	const startAt: number[] = [];
	const durations: number[] = [];
	// When the cursor is free for the next word.
	let cursor = 0;

	function schedule(index: number, word: string, now: number) {
		if (startAt[index] !== undefined) return;
		const duration = revealMs(word);
		const start = Math.max(now + LEAD_MS, cursor);
		startAt[index] = start;
		durations[index] = duration;
		cursor = start + duration * (1 - OVERLAP);
	}

	function wrapFreshWords(root: DocumentFragment, now: number) {
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		const nodes: Text[] = [];
		while (walker.nextNode()) nodes.push(walker.currentNode as Text);

		let index = 0;
		for (const node of nodes) {
			const parts = node.data.split(/(\s+)/);
			if (!parts.some((part) => part && !/^\s+$/.test(part))) continue;
			const fragment = document.createDocumentFragment();
			for (const part of parts) {
				if (!part) continue;
				if (/^\s+$/.test(part)) {
					fragment.append(part);
					continue;
				}
				schedule(index, part, now);
				const delay = startAt[index] - now;
				const duration = durations[index];
				index += 1;
				if (delay + duration <= 0) {
					fragment.append(part);
					continue;
				}
				const span = document.createElement('span');
				span.className = 'chat-flow-word';
				span.style.animationDelay = `${Math.round(delay)}ms`;
				span.style.animationDuration = `${duration}ms`;
				span.textContent = part;
				fragment.append(span);
			}
			node.replaceWith(fragment);
		}
	}

	const shown = $derived.by(() => {
		if (!animated || typeof document === 'undefined') return html;
		const template = document.createElement('template');
		template.innerHTML = html;
		wrapFreshWords(template.content, performance.now());
		return template.innerHTML;
	});
</script>

<div data-slot="chat-flow-text" class={className}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- the caller hands in sanitized HTML; only plain spans are added -->
	{@html shown}
</div>

<style>
	/* A mask three times the word's width — opaque, a soft edge about half a
	   word wide, transparent — slides across it, so the word is uncovered from
	   its first letter to its last, at an even pace. Delay and duration are set
	   per word (see schedule()); 800ms is the fallback. */
	div :global(.chat-flow-word) {
		display: inline-block;
		-webkit-mask-image: linear-gradient(90deg, #000 42%, transparent 58%);
		mask-image: linear-gradient(90deg, #000 42%, transparent 58%);
		-webkit-mask-size: 300% 100%;
		mask-size: 300% 100%;
		animation: chat-flow-word-in 800ms linear both;
	}

	/* Global on purpose: the spans are created outside Svelte's markup, and a
	   scoped keyframes name would be rewritten without their reference. */
	@keyframes -global-chat-flow-word-in {
		from {
			-webkit-mask-position: 100% 0;
			mask-position: 100% 0;
		}
		to {
			-webkit-mask-position: 0 0;
			mask-position: 0 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		div :global(.chat-flow-word) {
			animation: none;
			-webkit-mask-image: none;
			mask-image: none;
		}
	}
</style>
