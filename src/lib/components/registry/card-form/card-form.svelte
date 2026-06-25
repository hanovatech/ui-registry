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
	<Card.Root class="shadow-md">
		<Card.Header>
			<Card.Title>{title}</Card.Title>
			{#if description}
				<Card.Description>{description}</Card.Description>
			{/if}
		</Card.Header>
		<Card.Content class={contentClass}>
			{@render children()}
		</Card.Content>
		<Card.Footer
			class="py-3 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
		>
			<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap *:w-full sm:*:w-auto">
				{#if footerStart}
					{@render footerStart()}
				{/if}
			</div>
			<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap *:w-full sm:*:w-auto">
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
