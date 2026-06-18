<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import GlobeIcon from '@lucide/svelte/icons/globe';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    value?: string;
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
    placeholder = 'https://example.com',
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  const isValid = $derived(/^https?:\/\/.+\..+/.test(value));
</script>

<InputLabel {label} {required} valid={isValid} for={id} {hint}>
  <div class="relative">
    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground">
      <GlobeIcon class="size-4" />
    </span>
    <Input
      {id}
      type="url"
      inputmode="url"
      {placeholder}
      bind:value
      {disabled}
      {required}
      class="pl-9 {className}"
    />
  </div>
</InputLabel>
