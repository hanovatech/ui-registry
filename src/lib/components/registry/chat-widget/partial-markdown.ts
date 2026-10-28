// While an answer streams in, its markdown is often cut mid-construct: an
// opened `**` whose partner has not arrived, half a link, a list marker with no
// item yet. Rendered as is, that syntax flashes up as raw characters until the
// rest arrives. `settlePartialMarkdown()` closes or drops those loose ends so
// every intermediate state renders the way the finished text will.

function countMatches(text: string, re: RegExp): number {
	return text.match(re)?.length ?? 0;
}

export function settlePartialMarkdown(text: string): string {
	let out = text;

	// An unfinished code fence: close it, and leave the rest alone — inside code
	// nothing else is markdown.
	if (countMatches(out, /^```/gm) % 2 === 1) return `${out}\n\`\`\``;

	// A line that so far is only a list or heading marker.
	out = out.replace(/(^|\n)[ \t]*(?:[-*+]|\d+\.|#{1,6})[ \t]*$/, '$1');

	// Half a link or image: keep its text, drop the brackets and the URL so far.
	out = out.replace(/!?\[([^\]\n]*)\]\([^)\n]*$/, '$1');
	out = out.replace(/!?\[([^\]\n]*)$/, '$1');

	// Inline code.
	if (countMatches(out, /`/g) % 2 === 1) {
		out = out.endsWith('`') ? out.slice(0, -1) : `${out}\``;
	}

	// Bold, then italic (a `*` that is not part of `**` and not a list marker).
	if (countMatches(out, /\*\*/g) % 2 === 1) {
		out = /\*\*\s*$/.test(out) ? out.replace(/\s*\*\*\s*$/, '') : `${out.trimEnd()}**`;
	}
	const singles = out.replace(/\*\*/g, '').replace(/^[ \t]*\*[ \t]/gm, '');
	if (countMatches(singles, /\*/g) % 2 === 1) {
		out = /\*\s*$/.test(out) ? out.replace(/\s*\*\s*$/, '') : `${out.trimEnd()}*`;
	}

	return out;
}
