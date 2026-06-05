<script lang="ts">
  import { page } from "$app/state";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import JsonTree from "$lib/components/registry/json-tree/json-tree.svelte";
  import Code from "@lucide/svelte/icons/code";
  import type { Snippet } from "svelte";

  interface Props {
    /** Whether the trigger is shown. Gate this behind your own admin/dev check. */
    visible?: boolean;
    /** Data to display. Defaults to the current page state. */
    data?: unknown;
    /**
     * Custom trigger. Spread the provided `props` onto your own clickable
     * element to open the dialog. Falls back to a ghost icon button.
     */
    children?: Snippet<[Record<string, unknown>]>;
  }

  let { visible = true, data = page, children }: Props = $props();

  let isOpen = $state(false);
</script>

{#if visible}
  <Dialog.Root bind:open={isOpen}>
    {#if children}
      <Dialog.Trigger>
        {#snippet child({ props })}
          {@render children(props)}
        {/snippet}
      </Dialog.Trigger>
    {:else}
      <Dialog.Trigger class={buttonVariants({ variant: "ghost", size: "icon" })} title="View page data">
        <Code />
      </Dialog.Trigger>
    {/if}
    <Dialog.Content class="sm:max-w-5xl w-full h-[80vh] flex flex-col">
      <Dialog.Header>
        <Dialog.Title>Page Data</Dialog.Title>
        <Dialog.Description>
          All data returned by the page component
        </Dialog.Description>
      </Dialog.Header>
      <div class="bg-muted rounded-lg p-4 overflow-auto flex-1 min-h-0">
        <JsonTree {data} />
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
