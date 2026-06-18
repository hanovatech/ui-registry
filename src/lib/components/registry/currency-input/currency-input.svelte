<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    /** Bound value as a number (e.g. `1234.56`), or `null` for empty. */
    value?: number | null;
    currency?: 'EUR' | 'USD';
    disabled?: boolean;
    required?: boolean;
    label?: string;
    hint?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(null),
    currency = 'EUR',
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  const symbol = $derived(currency === 'EUR' ? '€' : '$');
  const isPrefix = $derived(currency === 'USD');

  let displayValue = $state(value != null ? format(value) : '');

  $effect(() => {
    const v = value;
    untrack(() => {
      if (parse(displayValue) === v) return;
      displayValue = v != null ? format(v) : '';
    });
  });

  /** Number → German display string: `1.234,56` */
  function format(n: number): string {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /** Display string → number; `null` if empty or incomplete. */
  function parse(s: string): number | null {
    if (!s) return null;
    const normalized = s.replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return isNaN(n) ? null : n;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const el = e.currentTarget;
    let raw = el.value.replace(/[^0-9,]/g, '');
    // Only one comma
    const ci = raw.indexOf(',');
    if (ci !== -1) raw = raw.slice(0, ci + 1) + raw.slice(ci + 1).replace(/,/g, '');
    el.value = raw;
    displayValue = raw;
    value = parse(raw);
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const n = parse(e.currentTarget.value);
    if (n == null) {
      value = null;
      displayValue = '';
      e.currentTarget.value = '';
    } else {
      value = n;
      displayValue = format(n);
      e.currentTarget.value = displayValue;
    }
  }
</script>

<InputLabel {label} {required} valid={value != null} for={id} {hint}>
  <div class="relative">
    <Input
      {id}
      type="text"
      inputmode="decimal"
      placeholder="0,00"
      value={displayValue}
      {disabled}
      {required}
      class={`${isPrefix ? 'pl-7' : 'pr-7'}${className ? ' ' + className : ''}`}
      oninput={handleInput}
      onblur={handleBlur}
    />
    <span
      class={`pointer-events-none absolute inset-y-0 flex items-center text-sm text-muted-foreground ${isPrefix ? 'left-0 pl-2.5' : 'right-0 pr-2.5'}`}
    >
      {symbol}
    </span>
  </div>
</InputLabel>
