<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import * as Command from '$lib/components/ui/command/index.js';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import { t } from '$lib/stores/i18n';

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    /** URL search param this filter writes, as a comma-separated list (`?status=OPEN,PENDING`). */
    key: string;
    options: Option[];
    /** Trigger text while nothing is selected; otherwise the selected labels are shown. */
    placeholder?: string;
    label?: string;
    class?: string;
    /** Show a search field in the popover. Defaults to on once there are more than 7 options. */
    searchable?: boolean;
  }

  let {
    key,
    options,
    placeholder = '',
    label = '',
    class: className = 'w-[220px] bg-background',
    searchable = undefined,
  }: Props = $props();

  let open = $state(false);
  let query = $state('');

  const showSearch = $derived(searchable ?? options.length > 7);

  // Values from the URL, restricted to known options so a stale or hand-edited
  // link can't render an unlabeled selection. Written optimistically on toggle,
  // so quick consecutive clicks don't read a URL the previous goto hasn't
  // updated yet; the next navigation re-derives it from the URL.
  let selectedValues = $derived.by(() => {
    const raw = (page.url.searchParams.get(key) ?? '').split(',');
    return options.filter((o) => raw.includes(o.value)).map((o) => o.value);
  });
  const selected = $derived(options.filter((o) => selectedValues.includes(o.value)));

  const results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  });

  function apply(next: string[]) {
    selectedValues = options.filter((o) => next.includes(o.value)).map((o) => o.value);
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.delete('page');
    if (selectedValues.length > 0) params.set(key, selectedValues.join(','));
    else params.delete(key);
    // URLSearchParams encodes the separator as %2C; commas are legal in a query
    // string, so keep them readable (`?status=OPEN,WAITING`). Reading back via
    // searchParams.get() decodes either form, so both stay interchangeable.
    const query = params.toString().replaceAll('%2C', ',');
    goto(`${page.url.pathname}?${query}`, { keepFocus: true, noScroll: true });
  }

  function toggle(value: string) {
    apply(
      selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value],
    );
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <span class="text-xs font-medium text-foreground/75 leading-none">{label}</span>
    {@render filter()}
  </div>
{:else}
  {@render filter()}
{/if}

{#snippet filter()}
  <Popover.Root bind:open onOpenChange={(o) => !o && (query = '')}>
    <Popover.Trigger
      role="combobox"
      aria-expanded={open}
      aria-label={label || placeholder || undefined}
      class="border-input dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 flex h-8 items-center gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 {className}"
    >
      {#if selected.length > 0}
        <span class="min-w-0 truncate">{selected.map((o) => o.label).join(', ')}</span>
        {#if selected.length > 1}
          <span class="bg-primary text-primary-foreground ml-auto rounded-full px-1.5 text-xs leading-5 font-medium tabular-nums">
            {selected.length}
          </span>
        {/if}
      {:else}
        <span class="truncate">{placeholder}</span>
      {/if}
      <ChevronDownIcon class="text-muted-foreground pointer-events-none size-4 shrink-0 {selected.length > 1 ? '' : 'ml-auto'}" />
    </Popover.Trigger>
    <Popover.Content class="w-(--bits-popover-anchor-width) min-w-56 gap-0 p-0" align="start">
      <Command.Root shouldFilter={false}>
        {#if showSearch}
          <Command.Input
            placeholder={$t.common.searchPlaceholder}
            value={query}
            oninput={(e) => (query = e.currentTarget.value)}
          />
        {/if}
        <Command.List class="max-h-60">
          {#if results.length === 0}
            <Command.Empty>{$t.common.noResults}</Command.Empty>
          {:else}
            <Command.Group>
              {#each results as option (option.value)}
                <Command.Item
                  value={option.value}
                  onSelect={() => toggle(option.value)}
                  data-checked={selectedValues.includes(option.value)}
                >
                  <span class="min-w-0 flex-1 truncate">{option.label}</span>
                </Command.Item>
              {/each}
            </Command.Group>
          {/if}
        </Command.List>
      </Command.Root>
      <div class="border-t px-1 py-1">
        <button
          type="button"
          onclick={() => apply([])}
          disabled={selected.length === 0}
          class="text-muted-foreground hover:bg-muted hover:text-foreground w-full rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {$t.common.clear}
        </button>
      </div>
    </Popover.Content>
  </Popover.Root>
{/snippet}
