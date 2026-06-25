<script lang="ts" module>
  export interface SearchResult {
    id: string;
    /** Optional group heading the result is listed under. */
    type?: string;
    title?: string;
    name?: string;
    description?: string;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/stores/i18n';
  import { Button } from '$lib/components/ui/button/index.js';
  import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from '$lib/components/ui/command/index.js';
  import Search from '@lucide/svelte/icons/search';

  interface Props {
    /** Fetch results for a query. Called debounced as the user types. */
    search: (query: string) => Promise<SearchResult[]>;
    /** Invoked when a result is selected. Handle navigation here. */
    onSelect: (result: SearchResult) => void;
    /** Whether the trigger is shown. Gate this behind your own auth/role check. */
    visible?: boolean;
    /** Debounce in ms before search() fires. */
    debounceMs?: number;
    placeholder?: string;
    startTypingLabel?: string;
    noResultsLabel?: string;
    loadingLabel?: string;
  }

  let {
    search,
    onSelect,
    visible = true,
    debounceMs = 300,
    placeholder = $t.common.searchPlaceholder,
    startTypingLabel = $t.common.startTyping,
    noResultsLabel = $t.common.noResults,
    loadingLabel = $t.common.loading,
  }: Props = $props();

  let open = $state(false);
  let searchQuery = $state('');
  let results = $state<SearchResult[]>([]);
  let isLoading = $state(false);

  let searchTimeout: ReturnType<typeof setTimeout>;
  // Guards against out-of-order responses overwriting newer results.
  let requestId = 0;

  async function performSearch(query: string) {
    if (!query.trim()) {
      results = [];
      isLoading = false;
      return;
    }

    const current = ++requestId;
    isLoading = true;
    try {
      const data = await search(query);
      if (current === requestId) results = data;
    } catch (err) {
      console.error('Search error:', err);
      if (current === requestId) results = [];
    } finally {
      if (current === requestId) isLoading = false;
    }
  }

  function handleInput(e: Event) {
    searchQuery = (e.target as HTMLInputElement).value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(searchQuery), debounceMs);
  }

  function handleSelectResult(result: SearchResult) {
    open = false;
    searchQuery = '';
    results = [];
    onSelect(result);
  }

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open = true;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  // Group results by their `type` for sectioned display.
  const groupedResults = $derived.by(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const result of results) {
      const type = result.type || 'Other';
      (groups[type] ??= []).push(result);
    }
    return groups;
  });
</script>

{#if visible}
  <div>
    <!-- Search trigger (desktop) -->
    <Button
      variant="outline"
      class="hidden md:flex relative w-full md:w-64 justify-start lg:text-sm lg:text-muted-foreground"
      onclick={() => (open = true)}
    >
      <Search class="h-4 w-4 lg:mr-2 stroke-2 text-foreground shrink-0" />
      <span class="hidden md:inline-flex text-sm">{placeholder}</span>
      <kbd class="pointer-events-none ml-auto h-6 hidden md:flex select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
        <span class="text-[12px] leading-none">⌘</span>
        <span class="leading-none">K</span>
      </kbd>
    </Button>

    <!-- Search trigger (mobile) -->
    <Button variant="ghost" size="icon" class="md:hidden" onclick={() => (open = true)}>
      <Search class="h-5 w-5 stroke-[2.5]" />
    </Button>

    <!-- Command Dialog -->
    <CommandDialog {open} onOpenChange={(value) => (open = value)} class="sm:max-w-2xl">
      <Command class="rounded-lg border shadow-md">
        <CommandInput {placeholder} value={searchQuery} oninput={handleInput} />
        <CommandList>
          {#if isLoading}
            <div class="py-6 text-center text-sm text-muted-foreground">{loadingLabel}</div>
          {:else if !searchQuery}
            <div class="py-6 text-center text-sm text-muted-foreground">{startTypingLabel}</div>
          {:else if results.length === 0}
            <CommandEmpty>{noResultsLabel}</CommandEmpty>
          {:else}
            {#each Object.entries(groupedResults) as [type, typeResults] (type)}
              {#if typeResults.length > 0}
                <CommandGroup heading={type}>
                  {#each typeResults as result (result.id)}
                    <CommandItem
                      value={`${result.type}:${result.title ?? result.name}:${result.id}`}
                      onSelect={() => handleSelectResult(result)}
                      class="cursor-pointer"
                    >
                      <div class="font-medium text-sm">{result.title || result.name}</div>
                      {#if result.description}
                        <div class="text-xs text-muted-foreground ml-2">{result.description}</div>
                      {/if}
                    </CommandItem>
                  {/each}
                </CommandGroup>
              {/if}
            {/each}
          {/if}
        </CommandList>
      </Command>
    </CommandDialog>
  </div>
{/if}
