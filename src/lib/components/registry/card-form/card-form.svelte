<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { t } from '$lib/stores/i18n';
	import Save from '@lucide/svelte/icons/save';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		isLoading?: boolean;
		submitLabel?: string;
		submittingLabel?: string;
		contentClass?: string;
		onSubmit: (e: SubmitEvent) => void;
		children: Snippet;
		/** Rendered on the left side of the footer (e.g. a Delete button). */
		footerStart?: Snippet;
		/** Replaces the default Save button on the right side of the footer. */
		footer?: Snippet;
	}

	let {
		title,
		description,
		isLoading = false,
		submitLabel = $t.common.save,
		submittingLabel = $t.common.saving,
		contentClass = 'space-y-4',
		onSubmit,
		children,
		footerStart,
		footer
	}: Props = $props();
</script>

<form onsubmit={onSubmit}>
	<Card.Root>
		<Card.Header>
			<Card.Title>{title}</Card.Title>
			{#if description}
				<Card.Description>{description}</Card.Description>
			{/if}
		</Card.Header>
		<Card.Content class={contentClass}>
			{@render children()}
		</Card.Content>
		<Card.Footer class="py-3 flex-wrap justify-between gap-2">
			<div class="flex flex-wrap gap-2">
				{#if footerStart}
					{@render footerStart()}
				{/if}
			</div>
			<div class="flex flex-wrap gap-2">
				{#if footer}
					{@render footer()}
				{:else}
					<Button type="submit" disabled={isLoading}>
						<Save class="size-4" />
						{isLoading ? submittingLabel : submitLabel}
					</Button>
				{/if}
			</div>
		</Card.Footer>
	</Card.Root>
</form>
