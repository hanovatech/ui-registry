<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import { t } from '$lib/stores/i18n';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import ChevronUp from '@lucide/svelte/icons/chevron-up';
  import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
  import FunnelX from '@lucide/svelte/icons/funnel-x';

  // Shared frame around a list's URL-param filters. It knows nothing about the
  // individual filters — they stay the registry components, dropped into the
  // snippets — but it owns what every list page kept re-inventing: the split
  // into always-visible and on-demand filters, the count of active ones, and
  // "reset all". Visually one grey card so the filters read as a unit above
  // the table rather than as a loose row of dropdowns.
  interface Props {
    /** Optional heading above the filter row (e.g. on report pages). */
    title?: string;
    /** Optional one-line explanation under the heading. */
    description?: string;
    /** URL params of every filter inside the bar — drives the active count and reset. */
    keys: string[];
    /** Subset of `keys` living in the `secondary` snippet — decides whether it starts expanded. */
    secondaryKeys?: string[];
    search?: Snippet;
    /** Filters that stay visible next to the search box. */
    primary?: Snippet;
    /** Filters behind the "more filters" toggle. */
    secondary?: Snippet;
    /** Right-aligned controls that aren't filters (e.g. a layout switch). */
    actions?: Snippet;
  }

  let {
    title,
    description,
    keys,
    secondaryKeys = [],
    search,
    primary,
    secondary,
    actions
  }: Props = $props();

  function isActive(key: string): boolean {
    return (page.url.searchParams.get(key) ?? '') !== '';
  }
  const activeCount = $derived(keys.filter(isActive).length);
  const secondaryActiveCount = $derived(secondaryKeys.filter(isActive).length);

  // A deep link with a secondary filter set starts expanded; afterwards the
  // user's toggle wins, so this is deliberately read once.
  let expanded = $state(untrack(() => secondaryKeys.some(isActive)));

  function resetAll() {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    for (const key of keys) params.delete(key);
    params.delete('page');
    const qs = params.toString().replaceAll('%2C', ',');
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- query-string-only navigation
    goto(`?${qs}`, { keepFocus: true, noScroll: true });
  }
</script>

<div class="space-y-3 rounded-lg border bg-muted/40 p-3">
  {#if title || description}
    <div class="space-y-0.5">
      {#if title}
        <h3 class="text-sm font-medium">{title}</h3>
      {/if}
      {#if description}
        <p class="text-xs text-muted-foreground">{description}</p>
      {/if}
    </div>
  {/if}
  <!-- The search box takes whatever is left but never less than a readable
       width — when the toggle, reset and actions crowd the row, the actions
       cluster wraps onto a second line instead. Whether the primary filters
       carry labels is the page's call (tickets: none, the empty state names
       the type; reports: labelled), so the row aligns to the bottom edge —
       identical to centered without labels, and with labels the controls
       still share one line while only the labels rise above it. -->
  <div class="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-end">
    {#if search}
      <div class="min-w-48 flex-1 [&>div]:!w-full">{@render search()}</div>
    {/if}
    {#if primary}
      <!-- Fixed widths here — this row shares its space with the search box;
           the registry filters fill them with `w-full`. -->
      <div class="flex flex-wrap gap-2 [&>*]:w-full sm:[&>*]:w-44">{@render primary()}</div>
    {/if}
    <!-- Toggle and reset form one tight cluster; the non-filter actions sit
         apart from it behind a hairline so the two groups read as distinct.
         Button sizes match the h-8 inputs and filter triggers. -->
    <div class="flex items-center gap-3 lg:ml-auto">
      {#if secondary || activeCount > 0}
        <div class="flex items-center gap-0.5">
          {#if secondary}
            <Button
              variant={expanded ? 'secondary' : 'ghost'}
              aria-expanded={expanded}
              onclick={() => (expanded = !expanded)}
            >
              <SlidersHorizontal class="size-4" />
              {expanded ? $t.common.fewerFilters : $t.common.moreFilters}
              {#if secondaryActiveCount > 0}
                <Badge class="h-4 min-w-4 px-1 tabular-nums">{secondaryActiveCount}</Badge>
              {/if}
              {#if expanded}
                <ChevronUp class="size-4" />
              {:else}
                <ChevronDown class="size-4" />
              {/if}
            </Button>
          {/if}
          {#if activeCount > 0}
            <!-- Icon-only so the row keeps its single line; the label lives in the
                 tooltip and for screen readers. -->
            <Tooltip.Root delayDuration={200}>
              <Tooltip.Trigger>
                {#snippet child({ props })}
                  <Button {...props} variant="ghost" size="icon" onclick={resetAll}>
                    <FunnelX class="size-4" />
                    <span class="sr-only">{$t.common.resetFilters}</span>
                  </Button>
                {/snippet}
              </Tooltip.Trigger>
              <Tooltip.Content>{$t.common.resetFilters}</Tooltip.Content>
            </Tooltip.Root>
          {/if}
        </div>
      {/if}
      {#if actions}
        {#if secondary || activeCount > 0}
          <Separator orientation="vertical" class="!h-6" />
        {/if}
        {@render actions()}
      {/if}
    </div>
  </div>
  {#if secondary && expanded}
    <div class="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2 border-t pt-3">
      {@render secondary()}
    </div>
  {/if}
</div>
