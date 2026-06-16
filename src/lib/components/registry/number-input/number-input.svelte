<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';

  interface Props {
    /** Bound numeric value, or `null` for empty. */
    value?: number | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    min?: number;
    max?: number;
    /** Number of decimal places to format to on blur. Omit for integers. */
    decimals?: number;
    class?: string;
  }

  let {
    value = $bindable(null),
    placeholder = '',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    min,
    max,
    decimals,
    class: className = 'bg-background',
  }: Props = $props();

  let displayValue = $state(value != null ? formatValue(value) : '');

  $effect(() => {
    const v = value;
    untrack(() => {
      if (parse(displayValue) === v) return;
      displayValue = v != null ? formatValue(v) : '';
    });
  });

  function formatValue(n: number): string {
    if (decimals != null) {
      return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return n.toLocaleString('de-DE', { maximumFractionDigits: 20 });
  }

  function clamp(n: number): number {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  }

  // Parse display string: remove thousands dots, replace decimal comma with dot
  function parse(s: string): number | null {
    if (s === '' || s === '-') return null;
    const n = Number(s.replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const el = e.currentTarget;
    // Allow digits, comma (decimal), and leading minus
    let raw = el.value.replace(/[^0-9,\-]/g, '');
    // Only one comma
    const ci = raw.indexOf(',');
    if (ci !== -1) raw = raw.slice(0, ci + 1) + raw.slice(ci + 1).replace(/,/g, '');
    // Minus only at start
    raw = raw.startsWith('-') ? '-' + raw.slice(1).replace(/-/g, '') : raw.replace(/-/g, '');
    el.value = raw;
    displayValue = raw;
    const n = parse(raw);
    value = n != null ? clamp(n) : null;
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const n = parse(e.currentTarget.value);
    if (n == null) {
      value = null;
      displayValue = '';
      e.currentTarget.value = '';
    } else {
      const clamped = clamp(n);
      value = clamped;
      displayValue = formatValue(clamped);
      e.currentTarget.value = displayValue;
    }
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="flex items-center gap-1 text-xs font-medium text-foreground/75 leading-none">
      {label}
      {#if required}
        {#if value != null}
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
  <Input
    {id}
    type="text"
    inputmode={decimals != null ? 'decimal' : 'numeric'}
    {placeholder}
    value={displayValue}
    {disabled}
    {required}
    class={className}
    oninput={handleInput}
    onblur={handleBlur}
  />
{/snippet}
