<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    hint?: string;
    id?: string;
    maxlength?: number;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    maxlength,
    class: className = 'bg-background',
  }: Props = $props();
</script>

<InputLabel {label} {required} valid={!!value} for={id} {hint}>
  <Input
    {id}
    type="text"
    {placeholder}
    bind:value
    {disabled}
    {required}
    {maxlength}
    class={className}
  />
</InputLabel>
