<script lang="ts">
  import { untrack } from 'svelte';
  import ChevronUp from '@lucide/svelte/icons/chevron-up';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import Input from '$lib/components/ui/input/input.svelte';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    /** Bound numeric value, or `null` for empty. */
    value?: number | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    hint?: string;
    id?: string;
    min?: number;
    max?: number;
    /** Number of decimal places to format to on blur. Omit for integers. */
    decimals?: number;
    /** Show up/down stepper arrows (also enables ArrowUp/ArrowDown keys). */
    stepper?: boolean;
    /** Increment/decrement applied by the stepper and arrow keys. */
    step?: number;
    class?: string;
  }

  let {
    value = $bindable(null),
    placeholder = '',
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    min,
    max,
    decimals,
    stepper = false,
    step = 1,
    class: className = 'bg-background',
  }: Props = $props();

  const upDisabled = $derived(disabled || (max != null && value != null && value >= max));
  const downDisabled = $derived(disabled || (min != null && value != null && value <= min));

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

  // Round to the precision implied by `decimals` or `step` to avoid float drift.
  function roundToStep(n: number): number {
    const p = decimals ?? (String(step).split('.')[1]?.length ?? 0);
    const f = 10 ** p;
    return Math.round(n * f) / f;
  }

  function stepBy(dir: 1 | -1) {
    if (disabled) return;
    const base = value ?? 0;
    const next = clamp(roundToStep(base + dir * step));
    value = next;
    displayValue = formatValue(next);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!stepper) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(-1);
    }
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

<InputLabel {label} {required} valid={value != null} for={id} {hint}>
  {#if stepper}
    <div class="relative">
      <Input
        {id}
        type="text"
        inputmode={decimals != null ? 'decimal' : 'numeric'}
        {placeholder}
        value={displayValue}
        {disabled}
        {required}
        class={`${className} pr-7`}
        oninput={handleInput}
        onblur={handleBlur}
        onkeydown={handleKeydown}
      />
      <div class="absolute inset-y-0 right-0 grid w-6 grid-rows-2 overflow-hidden rounded-r-lg border-l">
        <button
          type="button"
          tabindex={-1}
          aria-label="Increment"
          disabled={upDisabled}
          onclick={() => stepBy(1)}
          class="grid place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronUp class="size-3.5 shrink-0 -translate-x-px" />
        </button>
        <button
          type="button"
          tabindex={-1}
          aria-label="Decrement"
          disabled={downDisabled}
          onclick={() => stepBy(-1)}
          class="grid place-items-center border-t text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronDown class="size-3.5 shrink-0 -translate-x-px" />
        </button>
      </div>
    </div>
  {:else}
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
  {/if}
</InputLabel>
