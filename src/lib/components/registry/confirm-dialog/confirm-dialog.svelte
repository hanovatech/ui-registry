<script lang="ts">
	import type { Snippet } from 'svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { t } from '$lib/stores/i18n';

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'default' | 'destructive';
		isLoading?: boolean;
		onConfirm: () => void | Promise<void>;
		onOpenChange?: (open: boolean) => void;
		/** Optional content rendered between the header and the footer buttons. */
		children?: Snippet;
	}

	let {
		open = $bindable(),
		title,
		description,
		confirmLabel = $t.common.confirm,
		cancelLabel = $t.common.cancel,
		variant = 'default',
		isLoading = false,
		onConfirm,
		onOpenChange,
		children
	}: Props = $props();

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<AlertDialog.Root bind:open onOpenChange={handleOpenChange}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description>{description}</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>

		{#if children}
			{@render children()}
		{/if}

		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isLoading}>{cancelLabel}</AlertDialog.Cancel>
			<!-- Plain button (not AlertDialog.Action) so it does not auto-close; the caller
			     closes via bind:open after its async action resolves. -->
			<Button
				variant={variant === 'destructive' ? 'destructive' : 'default'}
				disabled={isLoading}
				onclick={onConfirm}
			>
				{#if isLoading}
					<LoaderCircle class="size-4 animate-spin" />
				{/if}
				{confirmLabel}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
