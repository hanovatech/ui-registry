<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';

  interface Props {
    /** Bound value as a number (amount), or `null` for empty. */
    value?: number | null;
    /** ISO 4217 currency code, e.g. `'EUR'` or `'USD'`. */
    currency?: string;
    locale?: string;
    min?: number;
    max?: number;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(null),
    currency = 'EUR',
    locale = 'de-DE',
    min,
    max,
    placeholder = '0,00',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  const formatter = $derived(
    new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  // Derive symbol and its position from a sample format
  const symbolInfo = $derived.by(() => {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0);
    const symPart = parts.find(p => p.type === 'currency');
    const sym = symPart?.value ?? currency;
    const before = parts.findIndex(p => p.type === 'currency') < parts.findIndex(p => p.type === 'integer');
    return { sym, before };
  });

  let display = $state('');
  let focused = $state(false);

  $effect(() => {
    const v = value;
    untrack(() => {
      if (!focused) display = v !== null && v !== undefined ? formatter.format(v) : '';
    });
  });

  function parse(raw: string): number | null {
    // Strip currency symbol and whitespace, normalise decimal separator
    const s = raw.replace(/[^\d,.\-]/g, '').trim();
    if (!s) return null;
    const normalised = s.replace(/[.,](?=\d{3}(?:[.,]|$))/g, '').replace(',', '.');
    const n = parseFloat(normalised);
    return isNaN(n) ? null : n;
  }

  function handleFocus(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    focused = true;
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
    if (n === null) { value = null; display = ''; return; }
    let clamped = n;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    // Round to 2 decimal places
    clamped = Math.round(clamped * 100) / 100;
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
  <div class="relative">
    <span
      class="pointer-events-none absolute inset-y-0 {symbolInfo.before ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-sm text-muted-foreground"
    >
      {symbolInfo.sym}
    </span>
    <Input
      {id}
      type="text"
      inputmode="decimal"
      value={display}
      {placeholder}
      {disabled}
      {required}
      class="{symbolInfo.before ? 'pl-7' : 'pr-8'} {className}"
      onfocus={handleFocus}
      oninput={handleInput}
      onblur={handleBlur}
    />
  </div>
{/snippet}
