<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';
  import { t } from '$lib/stores/i18n';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

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
    hint?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    options,
    placeholder = $t.common.selectPlaceholder,
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    class: className = 'w-full bg-background',
  }: Props = $props();

  const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? placeholder);
</script>

<InputLabel {label} {required} valid={!!value} for={id} {hint}>
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
</InputLabel>
