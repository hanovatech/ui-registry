<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { t } from '$lib/stores/i18n';

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		error?: string;
		isLoading?: boolean;
		submitLabel?: string;
		submittingLabel?: string;
		cancelLabel?: string;
		maxWidth?: string;
		onOpenChange?: (open: boolean) => void;
		onSubmit: (e: SubmitEvent) => void;
		children: Snippet;
		/** Optional snippet rendered after the error alert and before the children. */
		header?: Snippet;
		/** Optional snippet to replace the default footer buttons. */
		footer?: Snippet;
	}

	let {
		open = $bindable(),
		title,
		description,
		error,
		isLoading = false,
		submitLabel = $t.common.save,
		submittingLabel = $t.common.saving,
		cancelLabel = $t.common.cancel,
		maxWidth = 'sm:max-w-lg',
		onOpenChange,
		onSubmit,
		children,
		header,
		footer
	}: Props = $props();

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="flex max-h-[90svh] flex-col gap-0 overflow-hidden p-0 md:min-w-0 {maxWidth}">
		<!-- Dialog renders in a portal outside the app's Tooltip.Provider, so bake one in
		     here — otherwise tooltips inside the dialog throw "Tooltip.Provider not found". -->
		<Tooltip.Provider delayDuration={0}>
			<div class="border-b bg-muted/50 px-4 py-4">
				<Dialog.Title>{title}</Dialog.Title>
				{#if description}
					<Dialog.Description>{description}</Dialog.Description>
				{/if}
			</div>

			<form onsubmit={onSubmit} class="flex flex-1 flex-col overflow-hidden">
				<div class="flex-1 overflow-y-auto">
					<div class="space-y-4 px-4 py-4">
						{#if error}
							<Alert.Root variant="destructive">
								<Alert.Description>{error}</Alert.Description>
							</Alert.Root>
						{/if}

						{#if header}
							{@render header()}
						{/if}

						{@render children()}
					</div>
				</div>

				<div class="border-t bg-muted/50 px-4 py-4">
					{#if footer}
						{@render footer()}
					{:else}
						<div class="flex justify-end gap-2">
							<Button
								type="button"
								size="lg"
								variant="outline"
								onclick={() => (open = false)}
								disabled={isLoading}
							>
								{cancelLabel}
							</Button>
							<Button size="lg" type="submit" disabled={isLoading}>
								{isLoading ? submittingLabel : submitLabel}
							</Button>
						</div>
					{/if}
				</div>
			</form>
		</Tooltip.Provider>
	</Dialog.Content>
</Dialog.Root>
