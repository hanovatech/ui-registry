<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { t } from '$lib/stores/i18n';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import * as Pagination from '$lib/components/ui/pagination/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';

  interface Props {
    total: number;
    perPage?: number;
    siblingCount?: number;
    totalLabel?: string;
    /**
     * Page sizes the user can pick from. When set, a size select is rendered
     * next to the total count and writes the choice to `pageSizeKey` in the
     * URL — the consumer's `load()` has to forward that param to its query.
     */
    pageSizeOptions?: number[];
    /** URL search param the chosen page size is written to. */
    pageSizeKey?: string;
    pageSizeLabel?: string;
  }

  let {
    total,
    perPage = 10,
    siblingCount = 1,
    totalLabel,
    pageSizeOptions,
    pageSizeKey = 'limit',
    pageSizeLabel = $t.common.perPage,
  }: Props = $props();

  let currentPage = $derived(Number(page.url.searchParams.get('page')) || 1);

  // Not worth offering a choice when every option would show the same rows.
  let showPageSize = $derived(
    !!pageSizeOptions?.length && total > Math.min(...pageSizeOptions)
  );

  function handlePageChange(newPage: number) {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    if (newPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    gotoParams(params);
  }

  function handlePageSizeChange(value: string) {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    // The current page number means something else at a different size.
    params.delete('page');
    params.set(pageSizeKey, value);
    gotoParams(params);
  }

  function gotoParams(params: URLSearchParams) {
    goto(`${page.url.pathname}?${params.toString()}`);
  }
</script>

<!-- Total left, pages centered, page size right; stacked on narrow screens. -->
<div class="flex flex-col items-center gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr]">
  <Pagination.Root
    count={total}
    {perPage}
    {siblingCount}
    page={currentPage}
    onPageChange={handlePageChange}
    class="mx-0 w-auto sm:col-start-2 sm:row-start-1"
  >
    {#snippet children({ pages })}
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.PrevButton>
            <ChevronLeft class="size-4" />
            <span>{$t.common.previous}</span>
          </Pagination.PrevButton>
        </Pagination.Item>
        {#each pages as p, i (p.type === 'page' ? p.value : `ellipsis-${i}`)}
          {#if p.type === 'ellipsis'}
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          {:else}
            <Pagination.Item>
              <Pagination.Link page={p} isActive={currentPage === p.value}>
                {p.value}
              </Pagination.Link>
            </Pagination.Item>
          {/if}
        {/each}
        <Pagination.Item>
          <Pagination.NextButton>
            <span>{$t.common.next}</span>
            <ChevronRight class="size-4" />
          </Pagination.NextButton>
        </Pagination.Item>
      </Pagination.Content>
    {/snippet}
  </Pagination.Root>
  <p class="text-sm text-muted-foreground sm:col-start-1 sm:row-start-1 sm:justify-self-start">
    {total} {totalLabel ?? $t.common.entries}
  </p>
  {#if showPageSize && pageSizeOptions}
    <div
      class="flex items-center gap-2 text-sm text-muted-foreground sm:col-start-3 sm:row-start-1 sm:justify-self-end"
    >
      <Select.Root
        type="single"
        value={String(perPage)}
        onValueChange={handlePageSizeChange}
      >
        <Select.Trigger size="sm" aria-label={pageSizeLabel}>
          <span data-slot="select-value">{perPage}</span>
        </Select.Trigger>
        <Select.Content>
          {#each pageSizeOptions as option (option)}
            <Select.Item value={String(option)} label={String(option)} />
          {/each}
        </Select.Content>
      </Select.Root>
      <span>{pageSizeLabel}</span>
    </div>
  {/if}
</div>
