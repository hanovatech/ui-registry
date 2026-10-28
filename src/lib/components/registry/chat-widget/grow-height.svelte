<script lang="ts">
	import type { Snippet } from 'svelte';

	// Grows (and shrinks) smoothly with its content instead of jumping a line at
	// a time — for a reply that streams in. Starts at zero, so a new reply also
	// opens up rather than popping in.
	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className }: Props = $props();

	let contentHeight = $state(0);
</script>

<div
	data-slot="chat-grow-height"
	class={['overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none', className]}
	style:height="{contentHeight}px"
>
	<div bind:offsetHeight={contentHeight}>
		{@render children()}
	</div>
</div>
