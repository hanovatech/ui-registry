<script lang="ts">
  import { page } from '$app/state';
  import { gotoParams } from '$lib/components/registry/lib/navigation.js';
  import { t } from '$lib/stores/i18nStore';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import { Button } from "$lib/components/ui/button/index.js";

  interface Props {
    page: number;
    totalPages: number;
    total?: number;
    totalLabel?: string;
  }

  let {
    page: currentPage,
    totalPages,
    total,
    totalLabel,
  }: Props = $props();

  function handlePageChange(newPage: number) {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.set('page', newPage.toString());
    gotoParams(params);
  }
</script>

{#if totalPages > 1 || total != null}
  <div class="relative flex flex-col sm:flex-row items-center justify-center gap-2">
    {#if totalPages > 1}
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={currentPage === 1} onclick={() => handlePageChange(currentPage - 1)}>
          {$t.common.previous}
        </Button>
        <span class="text-sm text-muted-foreground">
          {$t.common.page} {currentPage} {$t.common.of} {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onclick={() => handlePageChange(currentPage + 1)}>
          {$t.common.next}
        </Button>
      </div>
    {/if}
    {#if total != null}
      <span class="sm:absolute sm:right-0 text-sm text-muted-foreground">
        {total} {totalLabel ?? $t.common.entries}
      </span>
    {/if}
  </div>
{/if}
