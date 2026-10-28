<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
  import Calendar from '@lucide/svelte/icons/calendar';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import { CalendarDate, type DateValue } from '@internationalized/date';
  import { t } from '$lib/stores/i18n';
  import { SvelteURLSearchParams } from 'svelte/reactivity';

  interface Props {
    value?: { start: DateValue | undefined; end: DateValue | undefined };
    showYearNavigation?: boolean;
    pickDateRangeLabel?: string;
    clearLabel?: string;
    applyLabel?: string;
    calendarWeekLabel?: string;
  }

  let {
    value = $bindable({ start: undefined, end: undefined }),
    showYearNavigation = false,
    pickDateRangeLabel = $t.common.pickDateRange,
    clearLabel = $t.common.clear,
    applyLabel = $t.common.apply,
    calendarWeekLabel = $t.common.calendarWeek
  }: Props = $props();

  const monthNames = $derived([
    $t.common.january, $t.common.february, $t.common.march,
    $t.common.april, $t.common.may, $t.common.june,
    $t.common.july, $t.common.august, $t.common.september,
    $t.common.october, $t.common.november, $t.common.december,
  ]);

  const isFullYear = $derived.by(() => {
    if (!value.start || !value.end) return false;
    return value.start.month === 1 && value.start.day === 1 &&
           value.end.month === 12 && value.end.day === 31 &&
           value.start.year === value.end.year;
  });

  const isFullMonth = $derived.by(() => {
    if (!value.start || !value.end) return false;
    if (isFullYear) return false;
    if (value.start.year !== value.end.year || value.start.month !== value.end.month) return false;
    if (value.start.day !== 1) return false;
    const lastDay = new Date(value.start.year, value.start.month, 0).getDate();
    return value.end.day === lastDay;
  });

  // Day of the week with Monday = 0, independent of the browser's locale.
  function isoWeekday(d: DateValue): number {
    return (new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay() + 6) % 7;
  }

  // ISO 8601 week number: a week belongs to the year its Thursday falls in.
  function isoWeekNumber(monday: DateValue): number {
    const thursday = monday.add({ days: 3 });
    const dayMs = 24 * 60 * 60 * 1000;
    const offset =
      (Date.UTC(thursday.year, thursday.month - 1, thursday.day) - Date.UTC(thursday.year, 0, 1)) /
      dayMs;
    return Math.floor(offset / 7) + 1;
  }

  // A full calendar week, Monday through Sunday.
  const isFullWeek = $derived.by(() => {
    if (!value.start || !value.end) return false;
    return isoWeekday(value.start) === 0 && value.start.add({ days: 6 }).compare(value.end) === 0;
  });

  const currentYear = $derived(value.start?.year ?? new Date().getFullYear());

  const showArrows = $derived(showYearNavigation && (isFullYear || isFullMonth || isFullWeek));

  const dateRangeLabel = $derived.by(() => {
    if (!value.start && !value.end) return pickDateRangeLabel;

    if (isFullYear) return `${value.start!.year}`;

    if (isFullMonth) {
      return `${monthNames[value.start!.month - 1]} ${value.start!.year}`;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const short = (d: DateValue) => `${pad(d.day)}.${pad(d.month)}.`;
    const full = (d: DateValue) => `${pad(d.day)}.${pad(d.month)}.${d.year}`;
    if (isFullWeek) {
      return `${calendarWeekLabel} ${isoWeekNumber(value.start!)} · ${short(value.start!)} – ${full(value.end!)}`;
    }
    if (value.start && value.end) return `${short(value.start)} – ${full(value.end)}`;
    if (value.start) return full(value.start);
    return pickDateRangeLabel;
  });

  const isEmpty = $derived(!value.start && !value.end);

  function applyFilter() {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.delete('page');
    if (value.start) params.set('startDate', toIso(value.start));
    if (value.end) params.set('endDate', toIso(value.end));
    gotoParams(params);
  }

  function clearFilter() {
    value = { start: undefined, end: undefined };
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.delete('startDate');
    params.delete('endDate');
    params.delete('page');
    gotoParams(params);
  }

  function navigate(delta: number) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.delete('page');

    if (isFullWeek) {
      const start = value.start!.add({ weeks: delta });
      const end = start.add({ days: 6 });
      value = { start, end };
      params.set('startDate', toIso(start));
      params.set('endDate', toIso(end));
    } else if (isFullMonth) {
      let y = value.start!.year;
      let m = value.start!.month + delta;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      const last = new Date(y, m, 0).getDate();
      value = { start: new CalendarDate(y, m, 1), end: new CalendarDate(y, m, last) };
      params.set('startDate', `${y}-${pad(m)}-01`);
      params.set('endDate', `${y}-${pad(m)}-${pad(last)}`);
    } else {
      const newYear = currentYear + delta;
      value = { start: new CalendarDate(newYear, 1, 1), end: new CalendarDate(newYear, 12, 31) };
      params.set('startDate', `${newYear}-01-01`);
      params.set('endDate', `${newYear}-12-31`);
    }

    gotoParams(params);
  }

  function toIso(d: DateValue): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.year}-${pad(d.month)}-${pad(d.day)}`;
  }

  function gotoParams(params: URLSearchParams) {
    goto(`${page.url.pathname}?${params.toString()}`);
  }
</script>

<div class="flex items-center gap-0">
  {#if showArrows}
    <Button variant="outline" class="rounded-r-none border-r-0" onclick={() => navigate(-1)}>
      <ChevronLeft class="h-4 w-4" />
    </Button>
  {/if}

  <Popover.Root>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          class="min-w-35 {showArrows ? 'justify-center rounded-none' : 'justify-start'} {isEmpty ? 'text-muted-foreground' : ''}"
        >
          <Calendar class="h-4 w-4 shrink-0" />
          {dateRangeLabel}
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content align="start" class="w-auto p-0">
      <RangeCalendar bind:value />
      <div class="flex gap-2 p-3 border-t">
        <Button size="sm" variant="outline" onclick={clearFilter} class="flex-1">
          {clearLabel}
        </Button>
        <Button size="sm" onclick={applyFilter} class="flex-1">
          {applyLabel}
        </Button>
      </div>
    </Popover.Content>
  </Popover.Root>

  {#if showArrows}
    <Button variant="outline" class="rounded-l-none border-l-0" onclick={() => navigate(1)}>
      <ChevronRight class="h-4 w-4" />
    </Button>
  {/if}
</div>
