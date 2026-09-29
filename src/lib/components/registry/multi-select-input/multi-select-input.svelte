<script lang="ts">
  import * as Popover from '$lib/components/ui/popover/index.js';
  import * as Command from '$lib/components/ui/command/index.js';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import XIcon from '@lucide/svelte/icons/x';
  import { t } from '$lib/stores/i18n';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Option {
    value: string;
    label: string;
    /** Secondary line under the label, also matched by the search. */
    description?: string;
  }

  interface Props {
    /** Bound selected values, in the order of `options`. `[]` = nothing selected. */
    value?: string[];
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    hint?: string;
    id?: string;
    class?: string;
    /** Show a search field in the popover. Defaults to on once there are more than 7 options. */
    searchable?: boolean;
    /** Chips shown in the trigger before the rest collapses into a `+N` chip. */
    maxChips?: number;
  }

  let {
    value = $bindable([]),
    options,
    placeholder = $t.common.selectPlaceholder,
    disabled = false,
    required = false,
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    class: className = 'w-full bg-background',
    searchable = undefined,
    maxChips = 3,
  }: Props = $props();

  let open = $state(false);
  let query = $state('');

  const showSearch = $derived(searchable ?? options.length > 7);
  // Selection is kept in option order, so the chips don't reshuffle depending
  // on the order the user clicked in.
  const selected = $derived(options.filter((o) => value.includes(o.value)));
  const visibleChips = $derived(selected.slice(0, maxChips));
  const hiddenCount = $derived(selected.length - visibleChips.length);

  const results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  });
  const allResultsSelected = $derived(
    results.length > 0 && results.every((o) => value.includes(o.value)),
  );

  function toggle(optionValue: string) {
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    value = options.filter((o) => next.includes(o.value)).map((o) => o.value);
  }

  function selectAllResults() {
    const next = new Set([...value, ...results.map((o) => o.value)]);
    value = options.filter((o) => next.has(o.value)).map((o) => o.value);
  }

  function clear() {
    value = [];
  }
</script>

<InputLabel {label} {required} valid={value.length > 0} for={id} {hint}>
  <Popover.Root bind:open onOpenChange={(o) => !o && (query = '')}>
    <div class="relative {className}">
      <Popover.Trigger
        {id}
        {disabled}
        role="combobox"
        aria-expanded={open}
        class="border-input dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-8 w-full items-center gap-1.5 rounded-lg border bg-transparent py-1 pl-1.5 text-left text-sm transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 {selected.length > 0 && !disabled ? 'pr-12' : 'pr-7'}"
      >
        {#if selected.length === 0}
          <span class="text-muted-foreground flex-1 truncate pl-1">{placeholder}</span>
        {:else}
          <span class="flex min-w-0 flex-1 flex-wrap gap-1">
            {#each visibleChips as option (option.value)}
              <span class="bg-secondary text-secondary-foreground max-w-40 truncate rounded-md px-1.5 py-0.5 text-xs font-medium">
                {option.label}
              </span>
            {/each}
            {#if hiddenCount > 0}
              <span class="bg-secondary text-muted-foreground rounded-md px-1.5 py-0.5 text-xs font-medium">+{hiddenCount}</span>
            {/if}
          </span>
        {/if}
      </Popover.Trigger>
      <ChevronDownIcon class="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2" />
      <!-- Sibling of the trigger, not a child: a button inside a button is invalid
           and would also toggle the popover on every clear. -->
      {#if selected.length > 0 && !disabled}
        <button
          type="button"
          onclick={clear}
          class="text-muted-foreground hover:text-foreground absolute top-1/2 right-7 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm transition-colors"
          aria-label={$t.common.clear}
        >
          <XIcon class="size-3.5" />
        </button>
      {/if}
    </div>
    <Popover.Content class="w-(--bits-popover-anchor-width) min-w-56 gap-0 p-0" align="start">
      <!-- Filtering happens here, not in cmdk: its built-in filter would match
           on the item value (often an id) instead of the label. -->
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
                  data-checked={value.includes(option.value)}
                >
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="truncate">{option.label}</span>
                    {#if option.description}
                      <span class="text-muted-foreground truncate text-xs">{option.description}</span>
                    {/if}
                  </span>
                </Command.Item>
              {/each}
            </Command.Group>
          {/if}
        </Command.List>
      </Command.Root>
      {#if options.length > 1}
        <div class="flex items-center justify-between border-t px-1 py-1">
          <button
            type="button"
            onclick={selectAllResults}
            disabled={allResultsSelected}
            class="hover:bg-muted rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            {$t.common.selectAll}
          </button>
          <button
            type="button"
            onclick={clear}
            disabled={value.length === 0}
            class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            {$t.common.clear}
          </button>
        </div>
      {/if}
    </Popover.Content>
  </Popover.Root>
</InputLabel>
