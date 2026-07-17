<script lang="ts" module>
  export interface TabBarTab {
    label: string;
    /** Pre-resolved href (the caller wraps paths in resolve()). */
    href: string;
  }
</script>

<script lang="ts">
  import { page } from '$app/state';
  import { t } from '$lib/stores/i18n';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';

  interface Props {
    /** Always-visible tabs; the first entry is treated as the section root
     *  (it matches by prefix only when no longer tab matches). */
    tabs: TabBarTab[];
    /** Tabs collapsed into the overflow menu. The active one is surfaced as a
     *  visible tab so the current location is never hidden. */
    moreTabs?: TabBarTab[];
    /** Accessible name for the nav element. */
    label?: string;
    /** Label of the overflow menu trigger. */
    moreLabel?: string;
    class?: string;
  }

  let {
    tabs,
    moreTabs = [],
    label,
    moreLabel = $t.common.more,
    class: className
  }: Props = $props();

  // Longest matching href wins — the section root (shortest) only matches
  // when no sub-route does.
  const activeHref = $derived.by(() => {
    const path = page.url.pathname;
    const all = [...tabs, ...moreTabs];
    const matches = all.filter((t) => path === t.href || path.startsWith(t.href + '/'));
    if (matches.length === 0) return tabs[0]?.href ?? '';
    return matches.reduce((longest, t) => (t.href.length > longest.href.length ? t : longest)).href;
  });

  const activeMoreTab = $derived(moreTabs.find((t) => t.href === activeHref) ?? null);
  const menuTabs = $derived(moreTabs.filter((t) => t.href !== activeHref));

  // Keep the active tab visible when the bar overflows horizontally.
  let nav = $state<HTMLElement | null>(null);
  $effect(() => {
    void activeHref;
    nav
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  });

  const baseClass =
    'flex shrink-0 items-center gap-1 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors';
  const activeClass = 'border-primary font-medium text-foreground';
  const inactiveClass =
    'border-transparent text-muted-foreground hover:border-border hover:text-foreground';
</script>

<nav
  bind:this={nav}
  class={['flex items-center overflow-x-auto border-b', className]}
  aria-label={label}
>
  {#each tabs as tab (tab.href)}
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- hrefs are pre-resolved by the caller -->
    <a
      href={tab.href}
      aria-current={activeHref === tab.href ? 'page' : undefined}
      class="{baseClass} {activeHref === tab.href ? activeClass : inactiveClass}"
    >
      {tab.label}
    </a>
  {/each}

  {#if activeMoreTab}
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- hrefs are pre-resolved by the caller -->
    <a href={activeMoreTab.href} aria-current="page" class="{baseClass} {activeClass}">
      {activeMoreTab.label}
    </a>
  {/if}

  {#if menuTabs.length > 0}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <button type="button" {...props} class="{baseClass} {inactiveClass}">
            {moreLabel}
            <ChevronDown class="size-3.5" />
          </button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        {#each menuTabs as tab (tab.href)}
          <DropdownMenu.Item>
            {#snippet child({ props })}
              <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- hrefs are pre-resolved by the caller -->
              <a href={tab.href} {...props}>{tab.label}</a>
            {/snippet}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/if}
</nav>
