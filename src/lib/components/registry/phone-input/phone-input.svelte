<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import PhoneIcon from '@lucide/svelte/icons/phone';
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
    placeholder = '+49 123 456789',
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  // Valid when at least 6 digits are present
  const isValid = $derived((value.match(/\d/g) ?? []).length >= 6);

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    // Allow only: digits, spaces, +, -, (, ), /
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9\s+\-()\/]/g, '');
    value = e.currentTarget.value;
  }
</script>

<InputLabel {label} {required} valid={isValid} for={id} {hint}>
  <div class="relative">
    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground">
      <PhoneIcon class="size-4" />
    </span>
    <Input
      {id}
      type="tel"
      inputmode="tel"
      {placeholder}
      {value}
      {disabled}
      {required}
      class="pl-9 {className}"
      oninput={handleInput}
    />
  </div>
</InputLabel>
