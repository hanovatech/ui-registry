<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { Calendar } from '$lib/components/ui/calendar/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import CalendarIcon from '@lucide/svelte/icons/calendar';
  import { CalendarDate, type DateValue } from '@internationalized/date';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    /** Bound value as an ISO date string (`YYYY-MM-DD`) or `''`. This is the only externally visible date format. */
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    locale?: string;
    minValue?: DateValue;
    maxValue?: DateValue;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = 'DD.MM.YYYY',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    locale = 'de-DE',
    minValue,
    maxValue,
    class: className = 'bg-background',
  }: Props = $props();

  // What the user sees / types. Locale-formatted (DD.MM.YYYY) — a UX detail, not the bound state.
  let displayValue = $state(isoToDisplay(value));
  let open = $state(false);
  let nativeEl: HTMLInputElement | undefined = $state();

  // Touch devices get the OS-native date picker; fine pointers get the popover calendar.
  let coarsePointer = $state(false);
  $effect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    coarsePointer = mq.matches;
    const onChange = (e: MediaQueryListEvent) => (coarsePointer = e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  });

  // Keep the visible text in sync when `value` changes externally (parent reset, server hydration),
  // without clobbering a partial edit (where `value` hasn't moved).
  $effect(() => {
    const iso = value;
    untrack(() => {
      if (displayToIso(displayValue) === iso) return;
      displayValue = isoToDisplay(iso);
    });
  });

  const isValid = $derived(/^\d{4}-\d{2}-\d{2}$/.test(value));

  function pad(n: number | string): string {
    return String(n).padStart(2, '0');
  }

  function toIso(d: DateValue | undefined): string {
    return d ? `${d.year}-${pad(d.month)}-${pad(d.day)}` : '';
  }

  /** ISO `YYYY-MM-DD` -> display `DD.MM.YYYY`; `''` for empty/invalid. */
  function isoToDisplay(iso: string): string {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
  }

  /** Display `DD.MM.YYYY` (1-2 digit day/month tolerated) -> ISO `YYYY-MM-DD`; `null` if incomplete or not a real date. */
  function displayToIso(display: string): string | null {
    const m = display.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return null;
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1) return null;
    const daysInMonth = new Date(y, mo, 0).getDate(); // mo is 1-indexed, day 0 -> last day of mo
    if (d > daysInMonth) return null;
    return `${y}-${pad(mo)}-${pad(d)}`;
  }

  // ISO -> CalendarDate for the popover calendar (undefined if empty/invalid).
  const calendarValue = $derived.by(() => {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return undefined;
    try {
      return new CalendarDate(Number(m[1]), Number(m[2]), Number(m[3]));
    } catch {
      return undefined;
    }
  });
  // Native <input type="date"> already speaks ISO.
  const nativeValue = $derived(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '');

  function formatDate(digits: string): string {
    let v = digits.slice(0, 8);
    if (v.length >= 5) v = v.slice(0, 2) + '.' + v.slice(2, 4) + '.' + v.slice(4);
    else if (v.length >= 3) v = v.slice(0, 2) + '.' + v.slice(2);
    return v;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const el = e.currentTarget;
    const pos = el.selectionStart ?? 0;
    const raw = el.value;
    const digitsBeforeCursor = raw.slice(0, pos).replace(/[^0-9]/g, '').length;
    const v = formatDate(raw.replace(/[^0-9]/g, ''));
    el.value = v;

    // Restore cursor so inserted dots don't push it around
    let seen = 0;
    let newPos = v.length;
    for (let i = 0; i < v.length; i++) {
      if (seen >= digitsBeforeCursor) {
        newPos = i;
        break;
      }
      if (/\d/.test(v[i])) seen++;
    }
    el.setSelectionRange(newPos, newPos);

    displayValue = v;
    // Only touch `value` when the edit settles into a complete state.
    if (v === '') value = '';
    else {
      const iso = displayToIso(v);
      if (iso) value = iso; // partial input leaves `value` unchanged
    }
  }

  function handleBlur() {
    const iso = displayToIso(displayValue);
    if (iso) {
      value = iso;
      displayValue = isoToDisplay(iso); // normalise padding, e.g. 5.3.2026 -> 05.03.2026
    }
  }

  function handleCalendar(v: DateValue | undefined) {
    if (v) {
      value = toIso(v);
      displayValue = isoToDisplay(value);
      open = false;
    }
  }

  function handleNative(e: Event & { currentTarget: HTMLInputElement }) {
    const nv = e.currentTarget.value; // yyyy-mm-dd
    value = nv;
    displayValue = isoToDisplay(nv);
  }

  function openNativePicker() {
    if (disabled || !nativeEl) return;
    try {
      nativeEl.showPicker();
    } catch {
      nativeEl.focus();
    }
  }
</script>

<InputLabel {label} {required} valid={isValid} for={id}>
  <div class="relative">
    <Input
      {id}
      type="text"
      inputmode="numeric"
      {placeholder}
      value={displayValue}
      {disabled}
      {required}
      class="{className} pr-9"
      oninput={handleInput}
      onblur={handleBlur}
    />

    {#if coarsePointer}
      <!-- Touch: trigger the OS-native date picker -->
      <button
        type="button"
        {disabled}
        tabindex="-1"
        aria-label="Open date picker"
        onclick={openNativePicker}
        class="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <CalendarIcon class="size-4" />
      </button>
      <input
        bind:this={nativeEl}
        type="date"
        value={nativeValue}
        {disabled}
        min={toIso(minValue)}
        max={toIso(maxValue)}
        tabindex="-1"
        aria-hidden="true"
        class="pointer-events-none absolute bottom-0 right-2 size-0 opacity-0"
        onchange={handleNative}
      />
    {:else}
      <!-- Pointer: shadcn calendar popover -->
      <Popover.Root bind:open>
        <Popover.Trigger>
          {#snippet child({ props })}
            <button
              {...props}
              type="button"
              {disabled}
              tabindex="-1"
              aria-label="Open date picker"
              class="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <CalendarIcon class="size-4" />
            </button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content align="end" class="w-auto p-0">
          <Calendar
            type="single"
            value={calendarValue}
            onValueChange={handleCalendar}
            {locale}
            {minValue}
            {maxValue}
            captionLayout="dropdown"
          />
        </Popover.Content>
      </Popover.Root>
    {/if}
  </div>
</InputLabel>
