<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import * as Command from '$lib/components/ui/command/index.js';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import { t } from '$lib/stores/i18n';

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    /** URL search param this filter writes — same contract as `SelectFilter`. */
    key: string;
    /** Preloaded options, shown while the query is empty. An option with value `''` resets the filter. */
    options: Option[];
    label?: string;
    placeholder?: string;
    /**
     * Server-side lookup for long lists the page cannot preload in full. Once
     * the user types, results come from here instead of filtering `options`.
     */
    search?: (query: string) => Promise<Option[]>;
    /** Label for a URL value that isn't among `options` (e.g. a deep link beyond the preloaded page). */
    selectedLabel?: string;
    class?: string;
  }

  let {
    key,
    options,
    label = '',
    placeholder = '',
    search = undefined,
    selectedLabel = '',
    class: className = 'w-[220px] bg-background',
  }: Props = $props();

  let open = $state(false);
  let query = $state('');
  let remoteResults = $state<Option[]>([]);
  let loading = $state(false);
  // The last pick from remote results isn't in `options`, so remember its label
  // for the trigger after navigation.
  let picked = $state<Option | null>(null);
  let debounceTimer: ReturnType<typeof setTimeout>;
  let querySeq = 0;

  const currentValue = $derived(page.url.searchParams.get(key) ?? '');
  const currentLabel = $derived(
    options.find((o) => o.value === currentValue)?.label ??
      (picked?.value === currentValue ? picked.label : ''),
  );
  const triggerLabel = $derived(currentLabel || (currentValue && selectedLabel) || placeholder);

  const isRemote = $derived(!!search && query.trim() !== '');
  const localResults = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  });
  const results = $derived(isRemote ? remoteResults : localResults);

  function handleInput(next: string) {
    query = next;
    clearTimeout(debounceTimer);
    querySeq++;
    if (!search || !next.trim()) {
      loading = false;
      return;
    }
    loading = true;
    const fn = search;
    const seq = querySeq;
    debounceTimer = setTimeout(async () => {
      try {
        const list = await fn(next.trim());
        if (seq === querySeq) remoteResults = list;
      } catch {
        if (seq === querySeq) remoteResults = [];
      } finally {
        if (seq === querySeq) loading = false;
      }
    }, 250);
  }

  function select(option: Option) {
    picked = option;
    open = false;
    query = '';
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.delete('page');
    if (option.value) params.set(key, option.value);
    else params.delete(key);
    goto(`${page.url.pathname}?${params.toString()}`, { keepFocus: true, noScroll: true });
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <span class="text-xs font-medium text-foreground/75 leading-none">{label}</span>
    {@render combobox()}
  </div>
{:else}
  {@render combobox()}
{/if}

{#snippet combobox()}
  <Popover.Root bind:open onOpenChange={(o) => !o && (query = '')}>
    <Popover.Trigger
      role="combobox"
      aria-expanded={open}
      aria-label={label || placeholder || undefined}
      class="border-input dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 items-center gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 {className}"
    >
      <span class="min-w-0 truncate">{triggerLabel}</span>
      <ChevronsUpDownIcon class="text-muted-foreground pointer-events-none ml-auto size-4 shrink-0 opacity-70" />
    </Popover.Trigger>
    <Popover.Content class="w-(--bits-popover-anchor-width) min-w-56 gap-0 p-0" align="start">
      <!-- Filtering happens here (locally or via `search`), not in cmdk: its
           built-in filter would re-hide server results that match on a field
           other than the label. -->
      <Command.Root shouldFilter={false}>
        <Command.Input
          placeholder={$t.common.searchPlaceholder}
          value={query}
          oninput={(e) => handleInput(e.currentTarget.value)}
        />
        <Command.List class="max-h-60">
          {#if isRemote && loading}
            <Command.Loading>
              <p class="text-muted-foreground py-4 text-center text-sm">{$t.common.loading}</p>
            </Command.Loading>
          {:else if results.length === 0}
            <Command.Empty>{$t.common.noResults}</Command.Empty>
          {:else}
            <Command.Group>
              {#each results as option (option.value)}
                <Command.Item
                  value={option.value || '__all__'}
                  onSelect={() => select(option)}
                  data-checked={option.value === currentValue}
                >
                  <span class="min-w-0 flex-1 truncate">{option.label}</span>
                </Command.Item>
              {/each}
            </Command.Group>
          {/if}
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
{/snippet}
