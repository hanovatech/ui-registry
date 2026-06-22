<script lang="ts">
  import Switch from '$lib/components/ui/switch/switch.svelte';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';

  interface Props {
    checked?: boolean;
    label?: string;
    description?: string;
    disabled?: boolean;
    required?: boolean;
    /** Wraps the switch in a bordered container. */
    bordered?: boolean;
    /**
     * Visual variant of the track.
     * - `default`: standard primary/input track (unchanged).
     * - `status`: colours the track (and the border, when `bordered`) green when on
     *   and orange when off, to make enable/disable state easy to spot.
     */
    variant?: 'default' | 'status';
    id?: string;
  }

  let {
    checked = $bindable(false),
    label = '',
    description = '',
    disabled = false,
    required = false,
    bordered = false,
    variant = 'default',
    id = crypto.randomUUID(),
  }: Props = $props();

  // Override the switch's base `data-checked:bg-primary` / `data-unchecked:bg-input`.
  // The inner ui/switch already runs its class through tailwind-merge, so these win.
  const statusTrackClass =
    'data-checked:bg-green-500 data-unchecked:bg-orange-500 dark:data-checked:bg-green-500 dark:data-unchecked:bg-orange-500';

  const trackClass = $derived(variant === 'status' ? statusTrackClass : undefined);

  const statusBorderClass = $derived(checked ? 'border-green-500' : 'border-orange-500');
</script>

<div
  class="flex items-center justify-between gap-4 {bordered
    ? `rounded-lg border bg-background px-4 py-3 ${variant === 'status' ? statusBorderClass : ''}`
    : ''}"
>
  {#if label}
    <div class="flex flex-col gap-0.5">
      <label for={id} class="flex items-center gap-1 text-xs font-medium text-foreground/75 leading-none">
        {label}
        {#if required}
          {#if checked}
            <CircleCheck class="size-3 text-green-500" />
          {:else}
            <CircleDashed class="size-3 text-destructive" />
          {/if}
        {/if}
      </label>
      {#if description}
        <p class="text-xs text-muted-foreground/70 leading-snug">{description}</p>
      {/if}
    </div>
  {/if}
  <Switch {id} bind:checked {disabled} class={trackClass} />
</div>
