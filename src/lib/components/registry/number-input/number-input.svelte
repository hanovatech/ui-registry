<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';

  interface Props {
    /** Bound value as a number, or `null` for empty. */
    value?: number | null;
    min?: number;
    max?: number;
    step?: number;
    locale?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(null),
    min,
    max,
    step,
    locale = 'de-DE',
    placeholder = '',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  const formatter = $derived(new Intl.NumberFormat(locale));

  let display = $state('');
  let focused = $state(false);

  // Sync display when value changes externally
  $effect(() => {
    const v = value;
    untrack(() => {
      if (!focused) display = v !== null && v !== undefined ? formatter.format(v) : '';
    });
  });

  function parse(raw: string): number | null {
    // Accept both comma and period as decimal separator; strip thousand separators
    const s = raw.trim().replace(/\s/g, '');
    if (s === '' || s === '-') return null;
    // Normalise: last comma/period is decimal separator if followed by ≤2 digits at end
    const normalised = s.replace(/[.,](?=\d{3}(?:[.,]|$))/g, '').replace(',', '.');
    const n = parseFloat(normalised);
    return isNaN(n) ? null : n;
  }

  function handleFocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    focused = true;
    // Show raw number for editing
    display = value !== null && value !== undefined ? String(value) : '';
    e.currentTarget.value = display;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    display = e.currentTarget.value;
    const n = parse(display);
    if (n !== null) value = n;
    else if (display === '') value = null;
  }

  function handleBlur() {
    focused = false;
    const n = parse(display);
    if (n === null) {
      value = null;
      display = '';
      return;
    }
    let clamped = n;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    if (step !== undefined) clamped = Math.round(clamped / step) * step;
    value = clamped;
    display = formatter.format(clamped);
  }
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
  <Input
    {id}
    type="text"
    inputmode="decimal"
    value={display}
    {placeholder}
    {disabled}
    {required}
    class={className}
    onfocus={handleFocus}
    oninput={handleInput}
    onblur={handleBlur}
  />
{/snippet}
