<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';
  import { t } from '$lib/stores/i18n';

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
    /** Render preset buttons on the same row as the input instead of below it. */
    presetsInline?: boolean;
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
    presetsInline = false,
    class: className = 'bg-background',
  }: Props = $props();

  const showInline = $derived(presetsInline && !!presets?.length);

  // Regexes that match a number followed by an hour/minute unit — including the
  // translated long forms (`Stunde`/`Stunden`, `Minute`/`Minuten`) so the
  // written-out display round-trips back through `parse`.
  const hourRe = $derived(unitRe([$t.common.hours, $t.common.hour, 'std', 'h']));
  const minRe = $derived(unitRe([$t.common.minutes, $t.common.minute, 'min', 'm']));

  function unitRe(words: string[]): RegExp {
    const alts = words
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean)
      // Longest first so `stunden` wins over `h`, `minuten` over `m`.
      .sort((a, b) => b.length - a.length)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`([\\d.]+)\\s*(?:${alts.join('|')})`);
  }

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
   * Accepts decimal hours (`4,5` / `4.5`) and unit notation — short
   * (`4h 30m`, `90m`, `45min`) or written out (`4 Stunden 30 Minuten`).
   * A bare number is interpreted as hours.
   */
  function parse(raw: string): number | null {
    const s = raw.trim().toLowerCase().replace(',', '.');
    if (!s) return null;

    // Any letter means unit notation; otherwise it is a plain decimal-hours value.
    if (/\p{L}/u.test(s)) {
      let mins = 0;
      let matched = false;
      const h = s.match(hourRe);
      if (h) {
        mins += parseFloat(h[1]) * 60;
        matched = true;
      }
      const m = s.match(minRe);
      if (m) {
        mins += parseFloat(m[1]);
        matched = true;
      } else if (h) {
        // Trailing minutes after the hours with no minute unit, e.g. `4h30`.
        const trail = s.slice(h.index! + h[0].length).match(/([\d.]+)/);
        if (trail) mins += parseFloat(trail[1]);
      }
      return matched ? Math.round(mins) : null;
    }

    // Bare number → decimal hours.
    const n = parseFloat(s);
    return isNaN(n) ? null : Math.round(n * 60);
  }

  /** Format whole minutes written out, e.g. `4 hours 30 minutes`. */
  function format(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const parts: string[] = [];
    if (h) parts.push(`${h} ${h === 1 ? $t.common.hour : $t.common.hours}`);
    if (m) parts.push(`${m} ${m === 1 ? $t.common.minute : $t.common.minutes}`);
    if (parts.length === 0) parts.push(`0 ${$t.common.minutes}`);
    return parts.join(' ');
  }

  /** Compact unit notation for the preset buttons, e.g. `4h 30m`. */
  function formatShort(mins: number): string {
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

{#snippet inputField()}
  <Input
    {id}
    type="text"
    inputmode="text"
    {placeholder}
    value={displayValue}
    {disabled}
    {required}
    class={showInline ? `${className} sm:flex-1` : className}
    oninput={handleInput}
    onblur={handleBlur}
  />
{/snippet}

{#snippet presetButtons()}
  <ButtonGroup.Root class={showInline ? 'h-8' : 'h-5'}>
    {#each presets ?? [] as preset (preset)}
      <Button
        type="button"
        variant={value === clamp(preset) ? 'default' : 'outline'}
        size="sm"
        class={`h-full font-normal ${showInline ? 'px-3 text-xs' : 'px-2 text-[11px]'}`}
        {disabled}
        onclick={() => applyPreset(preset)}
      >
        {formatShort(preset)}
      </Button>
    {/each}
  </ButtonGroup.Root>
{/snippet}

<InputLabel {label} {required} valid={value != null} for={id} {hint}>
  {#if showInline}
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      {@render inputField()}
      {@render presetButtons()}
    </div>
  {:else}
    {@render inputField()}
    {#if presets?.length}
      {@render presetButtons()}
    {/if}
  {/if}
</InputLabel>
