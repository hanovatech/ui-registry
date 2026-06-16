<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    /** Bound selected value. */
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
    placeholder = 'Select…',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  const selectedLabel = $derived(options.find(o => o.value === value)?.label ?? placeholder);
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="text-xs font-medium text-muted-foreground leading-none">
      {label}{#if required}<span class="text-destructive ml-0.5">*</span>{/if}
    </label>
    {@render field()}
  </div>
{:else}
  {@render field()}
{/if}

{#snippet field()}
  <Select.Root type="single" {value} onValueChange={(v) => (value = v)} {disabled}>
    <Select.Trigger {id} class={className}>
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
  {#if required}
    <input type="text" {value} {required} tabindex="-1" aria-hidden="true" class="pointer-events-none absolute h-0 w-0 opacity-0" />
  {/if}
{/snippet}
