export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
	id: string;
	role: ChatRole;
	content: string;
	/** Epoch milliseconds, set when the message is created. */
	createdAt?: number;
	/** Free room for consumer data; passed to the transport untouched. */
	meta?: Record<string, unknown>;
}

/**
 * An error whose message is meant for the visitor, e.g. the server's
 * "too many requests" hint. Any other error shows the generic error label
 * instead — "Failed to fetch" or a TypeError is nothing to put in a chat.
 */
export class ChatError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ChatError';
	}
}

/**
 * Streams the assistant's reply to the conversation so far, chunk by chunk.
 * Throw a `ChatError` to show its message in the thread. The signal aborts
 * when the visitor stops the reply, resets the conversation or closes the panel.
 */
export type ChatTransport = (
	messages: ChatMessage[],
	options: { signal: AbortSignal }
) => AsyncIterable<string>;

export type ChatSegment =
	| { type: 'text'; value: string }
	| { type: 'link'; value: string; href: string };

export type ChatLinkify = (text: string) => ChatSegment[];

export function chatId(): string {
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Reads `data:` lines from a `fetch` response. The built-in EventSource only
 * does GET, but a chat needs POST, so the body is read by hand. Lines that are
 * not JSON (e.g. `[DONE]`) are skipped instead of breaking the stream.
 */
export async function* readSse(response: Response): AsyncGenerator<unknown> {
	if (!response.body) throw new Error('Response without body');

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let finished = false;

	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) {
				finished = true;
				break;
			}
			buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

			// Events end with a blank line; whatever follows the last one is
			// an incomplete event waiting for the next chunk.
			let boundary = buffer.indexOf('\n\n');
			while (boundary !== -1) {
				const raw = buffer.slice(0, boundary);
				buffer = buffer.slice(boundary + 2);

				for (const line of raw.split('\n')) {
					if (!line.startsWith('data:')) continue;
					const data = line.slice(5).trim();
					if (!data) continue;
					try {
						yield JSON.parse(data);
					} catch {
						// Not JSON — skip it rather than abort the stream.
					}
				}

				boundary = buffer.indexOf('\n\n');
			}
		}
	} finally {
		// Stopped early (consumer broke off or `parse` threw): cancel, or the
		// body keeps downloading until the server is done.
		if (!finished) reader.cancel().catch(() => {});
		reader.releaseLock();
	}
}

export interface SseTransportOptions {
	endpoint: string;
	/** Static headers, or a function for per-request values such as a CSRF token. */
	headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
	/** Request body. Defaults to `{ messages: [{ role, content }] }`. */
	body?: (messages: ChatMessage[]) => unknown;
	/**
	 * Turns one parsed event into a text chunk. Return nothing to skip the
	 * event; throw a `ChatError` to end the reply with that message. Defaults
	 * to `{ type: 'text', text }` and `{ type: 'error', message }`.
	 */
	parse?: (event: any) => string | void;
	/** Picks the visitor-facing message from a JSON error response. Defaults to `message` or `error`. */
	errorMessage?: (body: any) => string | undefined;
}

function defaultBody(messages: ChatMessage[]) {
	return { messages: messages.map(({ role, content }) => ({ role, content })) };
}

function defaultParse(event: any): string | void {
	if (event?.type === 'text' && typeof event.text === 'string') return event.text;
	if (event?.type === 'error') {
		if (typeof event.message === 'string' && event.message) throw new ChatError(event.message);
		throw new Error('Error event without message');
	}
}

function defaultErrorMessage(body: any): string | undefined {
	const message = body?.message ?? body?.error;
	return typeof message === 'string' ? message : undefined;
}

/** A `ChatTransport` that POSTs the conversation and reads a server-sent event stream. */
export function createSseTransport({
	endpoint,
	headers,
	body = defaultBody,
	parse = defaultParse,
	errorMessage = defaultErrorMessage
}: SseTransportOptions): ChatTransport {
	return async function* (messages, { signal }) {
		const extraHeaders = typeof headers === 'function' ? await headers() : headers;
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'content-type': 'application/json', ...extraHeaders },
			body: JSON.stringify(body(messages)),
			signal
		});

		if (!response.ok) {
			// A JSON error comes from the chat service itself and may carry a
			// hint for the visitor. Anything else (a proxy's 502 page, a
			// misrouted dev proxy) looks the same to them, so the cause goes
			// to the console instead.
			const raw = await response.text();
			let message: string | undefined;
			try {
				message = errorMessage(JSON.parse(raw));
			} catch {
				console.error(
					`[chat] ${endpoint} answered ${response.status} without JSON. Is the chat service running and the proxy pointing at it?`,
					raw.slice(0, 200)
				);
			}
			if (message) throw new ChatError(message);
			throw new Error(`${endpoint} answered ${response.status}`);
		}

		// A 200 that isn't a stream — typically an HTML page from a misrouted
		// proxy — would otherwise end as a reply without a single word.
		const type = response.headers.get('content-type') ?? '';
		if (!type.includes('text/event-stream')) {
			await response.body?.cancel();
			throw new Error(`${endpoint} answered ${type || 'without content type'}, not text/event-stream`);
		}

		for await (const event of readSse(response)) {
			const chunk = parse(event);
			if (chunk) yield chunk;
		}
	};
}

export interface LinkifierOptions {
	/**
	 * Site paths that become links, e.g. `['/contact', '/services']`. Only
	 * these: a path the model invents stays plain text instead of a dead link.
	 */
	paths?: string[];
	/** Email domains whose addresses become `mailto:` links, e.g. `['example.com']`. */
	emailDomains?: string[];
	/** Also link `http(s)://` URLs. Off by default. */
	urls?: boolean;
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a `ChatLinkify` from an allowlist. Replies are never rendered as HTML;
 * the text is only split at known patterns and the matches become links.
 */
export function createLinkifier({ paths = [], emailDomains = [], urls = false }: LinkifierOptions): ChatLinkify {
	const alternatives: string[] = [];
	if (urls) alternatives.push(String.raw`https?:\/\/[^\s<>"')\]]+[^\s<>"')\].,;:!?]`);
	if (emailDomains.length > 0)
		alternatives.push(String.raw`[\w.+-]+@(?:${emailDomains.map(escapeRegExp).join('|')})\b`);
	if (paths.length > 0)
		alternatives.push(String.raw`(?<![\w/.])(?:${paths.map(escapeRegExp).join('|')})(?![\w-])`);

	if (alternatives.length === 0) return (text) => [{ type: 'text', value: text }];
	const pattern = new RegExp(alternatives.join('|'), 'g');

	return (text) => {
		const segments: ChatSegment[] = [];
		let last = 0;
		for (const match of text.matchAll(pattern)) {
			const start = match.index;
			const value = match[0];
			if (start > last) segments.push({ type: 'text', value: text.slice(last, start) });
			const href = value.includes('@') && !value.includes('://') ? `mailto:${value}` : value;
			segments.push({ type: 'link', value, href });
			last = start + value.length;
		}
		if (last < text.length) segments.push({ type: 'text', value: text.slice(last) });
		return segments;
	};
}

/** Who answers — shown in the consent step and above an empty conversation. */
export interface ChatProvider {
	/** e.g. `Mistral AI`. Also the logo's alt text. */
	name: string;
	/** Technical model id, shown as a badge, e.g. `mistral-medium-latest`. */
	model?: string;
	/** Where the data is processed, e.g. `Paris, France`. Added to the notice. */
	location?: string;
	/** Logo URL; the name is shown as text without one. */
	logo?: string;
}

/** Where agreement to the consent step is remembered. */
export type ChatConsentPersistence = 'session' | 'local' | 'none';
