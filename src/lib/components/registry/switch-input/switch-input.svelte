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
    id?: string;
  }

  let {
    checked = $bindable(false),
    label = '',
    description = '',
    disabled = false,
    required = false,
    bordered = false,
    id = crypto.randomUUID(),
  }: Props = $props();
</script>

<div class="flex items-center justify-between gap-4 {bordered ? 'rounded-lg border bg-background px-4 py-3' : ''}">
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
  <Switch {id} bind:checked {disabled} />
</div>
