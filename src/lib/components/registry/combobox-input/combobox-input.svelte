<script lang="ts" generics="T extends ComboboxOption">
  import type { Snippet } from 'svelte';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import * as Command from '$lib/components/ui/command/index.js';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import XIcon from '@lucide/svelte/icons/x';
  import { t } from '$lib/stores/i18n';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';
  import type { ComboboxOption, ComboboxSearch } from './types.js';

  interface Props {
    /** Bound selected value, or `''` for no selection. */
    value?: string;
    /**
     * Preloaded options. Without `search` they are filtered locally; with it they
     * are the list shown until the user types.
     */
    options?: T[];
    /**
     * Server-side lookup for lists too long to preload, called with the typed
     * query after a short debounce. Without `options` it is also called with `''`
     * when the popover opens, for the initial list. Pass a new function to change
     * the scope (e.g. another customer): that initial list reloads on next open.
     */
    search?: ComboboxSearch<T>;
    /** Label for a value that isn't among the loaded options (e.g. set on page load). */
    selectedLabel?: string;
    /** Looks up the label for such a value when `selectedLabel` isn't given. */
    resolveLabel?: (value: string) => Promise<string | null | undefined>;
    /** Fires on pick and on clear, with the picked option (`null` when cleared). */
    onValueChange?: (value: string, option: T | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    /** Shown while `search` provides no initial list and nothing has been typed yet. */
    startTypingLabel?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    hint?: string;
    id?: string;
    class?: string;
    /** Offer an x button that clears the selection. */
    clearable?: boolean;
    /** Treat the field as filled without a value — for a pending entry rendered via `selected`. */
    filled?: boolean;
    /** Custom list row. Defaults to label plus description. */
    item?: Snippet<[T]>;
    /**
     * Custom trigger content for the current selection. Gets the option (`null`
     * when it isn't loaded) and the resolved label (`''` while unknown).
     */
    selected?: Snippet<[T | null, string]>;
    /** Extra entries after the results, e.g. a "create …" action for the typed query. */
    extra?: Snippet<[{ query: string; results: T[]; close: () => void }]>;
  }

  let {
    value = $bindable(''),
    options = [],
    search = undefined,
    selectedLabel = '',
    resolveLabel = undefined,
    onValueChange,
    placeholder = $t.common.selectPlaceholder,
    searchPlaceholder = $t.common.searchPlaceholder,
    startTypingLabel = $t.common.startTyping,
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    class: className = 'w-full bg-background',
    clearable = true,
    filled = false,
    item,
    selected,
    extra,
  }: Props = $props();

  let open = $state(false);
  let query = $state('');
  let loading = $state(false);
  // Initial list of the current `search`, and which function it came from — a
  // new function means a new scope, so the list is stale.
  let initial = $state<T[]>([]);
  let initialFor = $state<ComboboxSearch<T> | null>(null);
  let queried = $state<T[]>([]);
  // The last picked option keeps its label after the list it came from is gone.
  let picked = $state<T | null>(null);
  let resolved = $state<{ value: string; label: string } | null>(null);
  let debounceTimer: ReturnType<typeof setTimeout>;
  // Separate counters: a typed query must not discard the initial list.
  let initialSeq = 0;
  let querySeq = 0;

  const isRemote = $derived(!!search);
  // Preloaded options win over an initial `search('')` round trip.
  const initialFromSearch = $derived(isRemote && options.length === 0);
  const results = $derived.by(() => {
    if (isRemote && query.trim()) return queried;
    if (initialFromSearch) return initial;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  });

  const currentOption = $derived.by((): T | null => {
    if (!value) return null;
    if (picked?.value === value) return picked;
    return [...options, ...initial, ...queried].find((o) => o.value === value) ?? null;
  });
  const displayLabel = $derived(
    currentOption?.label ||
      selectedLabel ||
      (resolved?.value === value ? resolved.label : ''),
  );
  const hasValue = $derived(!!value || filled);
  const showClear = $derived(clearable && hasValue && !disabled);

  $effect(() => {
    if (open && search && initialFromSearch && initialFor !== search) void loadInitial(search);
  });

  $effect(() => {
    if (!value || currentOption || selectedLabel || !resolveLabel) return;
    if (resolved?.value === value) return;
    const target = value;
    void resolveLabel(target)
      .catch(() => null)
      .then((name) => {
        // Drop the answer if the value moved on meanwhile. An unknown value still
        // counts as resolved (empty label), so the trigger stops showing "loading".
        if (value === target) resolved = { value: target, label: name ?? '' };
      });
  });

  let initialLoading = $state(false);
  async function loadInitial(fn: ComboboxSearch<T>) {
    initialFor = fn;
    const seq = ++initialSeq;
    initialLoading = true;
    try {
      const list = await fn('');
      if (seq === initialSeq) initial = list;
    } catch {
      // Let the next open retry instead of pinning an empty list to this scope.
      if (seq === initialSeq) initialFor = null;
    } finally {
      if (seq === initialSeq) initialLoading = false;
    }
  }

  function handleInput(next: string) {
    query = next;
    clearTimeout(debounceTimer);
    if (!search) return;
    querySeq++;
    if (!next.trim()) {
      loading = false;
      return;
    }
    loading = true;
    const fn = search;
    const seq = querySeq;
    debounceTimer = setTimeout(async () => {
      try {
        const list = await fn(next.trim());
        if (seq === querySeq) queried = list;
      } catch {
        if (seq === querySeq) queried = [];
      } finally {
        if (seq === querySeq) loading = false;
      }
    }, 250);
  }

  function close() {
    open = false;
    query = '';
    queried = [];
  }

  function select(option: T) {
    value = option.value;
    picked = option;
    close();
    onValueChange?.(option.value, option);
  }

  function clear() {
    value = '';
    picked = null;
    onValueChange?.('', null);
  }
</script>

<InputLabel {label} {required} valid={hasValue} for={id} {hint}>
  <Popover.Root
    bind:open
    onOpenChange={(o) => {
      if (!o) {
        query = '';
        queried = [];
      }
    }}
  >
    <div class="relative {className}">
      <Popover.Trigger
        {id}
        {disabled}
        role="combobox"
        aria-expanded={open}
        class="border-input dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 w-full items-center gap-1.5 rounded-lg border bg-transparent py-2 pl-2.5 text-left text-sm transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 {showClear ? 'pr-12' : 'pr-8'}"
      >
        {#if selected && hasValue}
          <span class="flex min-w-0 flex-1 items-center gap-1.5">{@render selected(currentOption, displayLabel)}</span>
        {:else if hasValue && displayLabel}
          <span class="min-w-0 flex-1 truncate">{displayLabel}</span>
        {:else if value && resolveLabel && resolved?.value !== value}
          <span class="text-muted-foreground min-w-0 flex-1 truncate">{$t.common.loading}</span>
        {:else}
          <span class="text-muted-foreground min-w-0 flex-1 truncate">{placeholder}</span>
        {/if}
      </Popover.Trigger>
      <ChevronsUpDownIcon class="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 opacity-70" />
      <!-- Sibling of the trigger, not a child: a button inside a button is invalid
           and would also toggle the popover on every clear. -->
      {#if showClear}
        <button
          type="button"
          onclick={clear}
          class="text-muted-foreground hover:text-foreground absolute top-1/2 right-7.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm transition-colors"
          aria-label={$t.common.clear}
        >
          <XIcon class="size-3.5" />
        </button>
      {/if}
    </div>
    <Popover.Content class="w-(--bits-popover-anchor-width) min-w-56 gap-0 p-0" align="start">
      <!-- Filtering happens here (locally or via `search`), not in cmdk: its
           built-in filter would match on the item value (often an id) and
           re-hide server results that matched on another field. -->
      <Command.Root shouldFilter={false}>
        <Command.Input
          placeholder={searchPlaceholder}
          value={query}
          oninput={(e) => handleInput(e.currentTarget.value)}
        />
        <Command.List class="max-h-60">
          {#if query.trim() ? loading : initialLoading}
            <Command.Loading>
              <p class="text-muted-foreground py-4 text-center text-sm">{$t.common.loading}</p>
            </Command.Loading>
          {:else}
            {#if results.length === 0}
              <Command.Empty>
                {initialFromSearch && !query.trim() ? startTypingLabel : $t.common.noResults}
              </Command.Empty>
            {:else}
              <Command.Group>
                {#each results as option (option.value)}
                  <Command.Item
                    value={option.value}
                    onSelect={() => select(option)}
                    data-checked={option.value === value}
                  >
                    {#if item}
                      {@render item(option)}
                    {:else}
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span class="truncate">{option.label}</span>
                        {#if option.description}
                          <span class="text-muted-foreground truncate text-xs">{option.description}</span>
                        {/if}
                      </span>
                    {/if}
                  </Command.Item>
                {/each}
              </Command.Group>
            {/if}
            {#if extra}
              {@render extra({ query: query.trim(), results, close })}
            {/if}
          {/if}
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
</InputLabel>
