import type { ChatChunk } from './chat.js';

// Paced reveal for `reveal="flow"`: models send text in bursts and far faster
// than anyone reads. These helpers hand it on word by word at a steady,
// readable pace; a growing backlog speeds up a little, never to a blur.

/** Characters per second with nothing waiting — about reading speed. */
const BASE_RATE = 32;
/** Extra characters per second for every character still waiting. */
const CATCH_UP = 0.05;
/** Upper bound, so a long answer does not race past the reader. */
const MAX_RATE = 50;

/** Reveal speed in characters per second, given how many are still waiting. */
export function revealRate(backlog: number): number {
	return Math.min(MAX_RATE, BASE_RATE + backlog * CATCH_UP);
}

/**
 * Characters to reveal after `elapsedMs`, plus what is left over for the next
 * step (so uneven timing neither stalls nor jumps). The carry may be negative —
 * a whole word revealed ahead of its time — and is paid off before anything
 * else appears.
 */
export function revealStep(
	backlog: number,
	elapsedMs: number,
	carry: number
): { chars: number; carry: number } {
	if (backlog <= 0) return { chars: 0, carry: 0 };
	const exact = carry + (revealRate(backlog) * elapsedMs) / 1000;
	const chars = Math.max(0, Math.min(backlog, Math.floor(exact)));
	return { chars, carry: chars === backlog ? 0 : exact - chars };
}

/**
 * Stretches a cut of `n` characters to the end of the word it falls into (and
 * the whitespace after it), so text appears word by word rather than mid-word.
 */
export function toWordEnd(text: string, n: number): number {
	if (n <= 0) return 0;
	if (n >= text.length) return text.length;
	// Already between a space and the next word.
	if (/\s/.test(text[n - 1]) && /\S/.test(text[n])) return n;
	const rest = text.slice(n);
	const end = rest.search(/\s/);
	if (end === -1) return text.length;
	const afterSpace = rest.slice(end).search(/\S/);
	return n + end + (afterSpace === -1 ? rest.length - end : afterSpace);
}

const FRAME_MS = 16;

function wait(ms: number, signal: AbortSignal): Promise<void> {
	return new Promise((resolve) => {
		const timer = setTimeout(resolve, ms);
		signal.addEventListener('abort', () => (clearTimeout(timer), resolve()), { once: true });
	});
}

/**
 * Re-times a reply stream: text comes out in whole words at reading pace,
 * status chunks pass straight through. The source is read ahead in the
 * background, so the model is never held up; an error surfaces once the text
 * before it has been shown.
 */
export async function* revealPaced(
	source: AsyncIterable<ChatChunk>,
	signal: AbortSignal
): AsyncGenerator<ChatChunk> {
	let backlog = '';
	const statuses: ChatChunk[] = [];
	let done = false;
	let failure: unknown = null;
	let wake: (() => void) | null = null;
	const notify = () => {
		wake?.();
		wake = null;
	};

	(async () => {
		try {
			for await (const chunk of source) {
				if (signal.aborted) break;
				if (typeof chunk === 'string') backlog += chunk;
				else statuses.push(chunk);
				notify();
			}
		} catch (e) {
			failure = e;
		} finally {
			done = true;
			notify();
		}
	})();

	let carry = 0;
	let last = performance.now();
	while (!signal.aborted) {
		while (statuses.length > 0) yield statuses.shift()!;

		if (!backlog) {
			if (done) break;
			// Nothing to show: sleep until the source delivers.
			await new Promise<void>((resolve) => (wake = resolve));
			last = performance.now();
			carry = 0;
			continue;
		}

		await wait(FRAME_MS, signal);
		const now = performance.now();
		const step = revealStep(backlog.length, now - last, carry);
		last = now;
		carry = step.carry;
		if (step.chars === 0) continue;

		// Whole words only. The word at the end may still be growing — wait for
		// the rest unless the stream is over.
		const end = toWordEnd(backlog, step.chars);
		if (end === backlog.length && /\S$/.test(backlog) && !done) {
			carry += step.chars;
			continue;
		}
		carry -= end - step.chars;
		const word = backlog.slice(0, end);
		backlog = backlog.slice(end);
		yield word;
	}

	if (failure && !signal.aborted) throw failure;
}
