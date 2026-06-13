<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import { Calendar } from '$lib/components/ui/calendar/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import CalendarIcon from '@lucide/svelte/icons/calendar';
  import { CalendarDate, type DateValue } from '@internationalized/date';

  interface Props {
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

  function toIso(d: DateValue | undefined): string {
    return d ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : '';
  }

  // dd.mm.yyyy -> CalendarDate / yyyy-mm-dd (undefined/empty if incomplete or invalid)
  const calendarValue = $derived.by(() => {
    const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) return undefined;
    try {
      return new CalendarDate(Number(m[3]), Number(m[2]), Number(m[1]));
    } catch {
      return undefined;
    }
  });
  const nativeValue = $derived(toIso(calendarValue));

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
    value = v;
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const m = e.currentTarget.value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m) {
      const d = Math.min(Math.max(parseInt(m[1]), 1), 31);
      const mo = Math.min(Math.max(parseInt(m[2]), 1), 12);
      value = `${String(d).padStart(2, '0')}.${String(mo).padStart(2, '0')}.${m[3]}`;
    }
  }

  function handleCalendar(v: DateValue | undefined) {
    if (v) {
      value = `${String(v.day).padStart(2, '0')}.${String(v.month).padStart(2, '0')}.${v.year}`;
      open = false;
    }
  }

  function handleNative(e: Event & { currentTarget: HTMLInputElement }) {
    const nv = e.currentTarget.value; // yyyy-mm-dd
    if (nv) {
      const [y, mo, d] = nv.split('-');
      value = `${d}.${mo}.${y}`;
    }
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

{#snippet calendarButton(props: Record<string, unknown> = {})}
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

{#snippet field()}
  <div class="relative">
    <Input
      {id}
      type="text"
      inputmode="numeric"
      {placeholder}
      {value}
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
            {@render calendarButton(props)}
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
{/snippet}
