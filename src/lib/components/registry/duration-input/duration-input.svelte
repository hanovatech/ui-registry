<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    /** Bound duration in whole minutes, or `null` for empty. */
    value?: number | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    hint?: string;
    id?: string;
    /** Lower clamp in minutes (default 0 — durations are non-negative). */
    min?: number;
    /** Upper clamp in minutes. */
    max?: number;
    /** Quick-pick buttons, each a duration in minutes (e.g. `[15, 30, 60]`). */
    presets?: number[];
    class?: string;
  }

  let {
    value = $bindable(null),
    placeholder = 'z. B. 4,5 oder 4h 30m',
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    min = 0,
    max,
    presets,
    class: className = 'bg-background',
  }: Props = $props();

  let displayValue = $state(value != null ? format(value) : '');

  $effect(() => {
    const v = value;
    untrack(() => {
      if (parse(displayValue) === v) return;
      displayValue = v != null ? format(v) : '';
    });
  });

  function clamp(n: number): number {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  }

  /**
   * Parse a free-form duration string into whole minutes.
   * Accepts decimal hours (`4,5` / `4.5`) and unit notation
   * (`4h 30m`, `4h30`, `2h`, `90m`, `45min`). A bare number is hours.
   */
  function parse(raw: string): number | null {
    const s = raw.trim().toLowerCase().replace(',', '.');
    if (!s) return null;

    if (/[hm]/.test(s)) {
      let mins = 0;
      let matched = false;
      const h = s.match(/([\d.]+)\s*h/);
      if (h) {
        mins += parseFloat(h[1]) * 60;
        matched = true;
      }
      const m = s.match(/([\d.]+)\s*m/);
      if (m) {
        mins += parseFloat(m[1]);
        matched = true;
      } else if (h) {
        // Trailing minutes after the hours with no `m` unit, e.g. `4h30`.
        const trail = s.slice(h.index! + h[0].length).match(/([\d.]+)/);
        if (trail) mins += parseFloat(trail[1]);
      }
      return matched ? Math.round(mins) : null;
    }

    // Bare number → decimal hours.
    const n = parseFloat(s);
    return isNaN(n) ? null : Math.round(n * 60);
  }

  /** Format whole minutes as compact unit notation, e.g. `4h 30m`. */
  function format(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    displayValue = e.currentTarget.value;
    const n = parse(displayValue);
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
      displayValue = format(clamped);
      e.currentTarget.value = displayValue;
    }
  }

  function applyPreset(mins: number) {
    const clamped = clamp(mins);
    value = clamped;
    displayValue = format(clamped);
  }
</script>

<InputLabel {label} {required} valid={value != null} for={id} {hint}>
  <Input
    {id}
    type="text"
    inputmode="text"
    {placeholder}
    value={displayValue}
    {disabled}
    {required}
    class={className}
    oninput={handleInput}
    onblur={handleBlur}
  />
  {#if presets?.length}
    <div class="flex flex-wrap gap-1">
      {#each presets as preset (preset)}
        <Button
          type="button"
          variant={value === clamp(preset) ? 'default' : 'outline'}
          size="sm"
          class="h-6 rounded px-2 text-[11px] font-normal"
          {disabled}
          onclick={() => applyPreset(preset)}
        >
          {format(preset)}
        </Button>
      {/each}
    </div>
  {/if}
</InputLabel>
