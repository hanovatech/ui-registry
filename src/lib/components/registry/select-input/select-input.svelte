<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    /** Bound selected value, or `''` for no selection. */
    value?: string;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    options,
    placeholder = 'Auswählen…',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'w-full bg-background',
  }: Props = $props();

  const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? placeholder);
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="flex items-center gap-1 text-xs font-medium text-foreground/75 leading-none">
      {label}
      {#if required}
        {#if value}
          <CircleCheck class="size-3 text-green-500" />
        {:else}
          <CircleDashed class="size-3 text-destructive" />
        {/if}
      {/if}
    </label>
    {@render field()}
  </div>
{:else}
  {@render field()}
{/if}

{#snippet field()}
  <Select.Root type="single" {value} onValueChange={(v) => (value = v)} {disabled}>
    <Select.Trigger id={id} class={className}>
      <span data-slot="select-value" class={value ? '' : 'text-muted-foreground'}>
        {selectedLabel}
      </span>
    </Select.Trigger>
    <Select.Content>
      {#each options as option (option.value)}
        <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
{/snippet}
