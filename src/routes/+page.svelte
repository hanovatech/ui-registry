<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import registry from '../registry.json';

  // Component imports for previews
  import PageHeader from '$lib/components/registry/page-header/page-header.svelte';
  import Pagination from '$lib/components/registry/pagination/pagination.svelte';
  import SearchFilter from '$lib/components/registry/search-filter/search-filter.svelte';
  import SelectFilter from '$lib/components/registry/select-filter/select-filter.svelte';
  import ButtonGroupFilter from '$lib/components/registry/button-group-filter/button-group-filter.svelte';
  import DateRangeFilter from '$lib/components/registry/date-range-filter/date-range-filter.svelte';
  import MonthFilter from '$lib/components/registry/month-filter/month-filter.svelte';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';
  import { SheetForm, SheetFormSection, SheetDetail } from '$lib/components/registry/sheet/index.js';
  import NavigationTabs from '$lib/components/registry/navigation-tabs/navigation-tabs.svelte';
  import JsonTree from '$lib/components/registry/json-tree/json-tree.svelte';
  import { Button } from '$lib/components/ui/button/index.js';

  const baseUrl = $derived(browser ? `${page.url.origin}${resolve('/')}`.replace(/\/$/, '') : '');

  const buildDate = new Date(import.meta.env.VITE_BUILD_DATE).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalItems = registry.items.length;

  const typeOrder: { type: string; label: string }[] = [
    { type: 'registry:ui', label: 'UI Components' },
    { type: 'registry:component', label: 'Components' },
    { type: 'registry:block', label: 'Blocks' },
    { type: 'registry:lib', label: 'Libraries' },
    { type: 'registry:hook', label: 'Hooks' },
    { type: 'registry:page', label: 'Pages' },
    { type: 'registry:file', label: 'Files' },
    { type: 'registry:style', label: 'Styles' },
    { type: 'registry:theme', label: 'Themes' },
  ];

  const sections = typeOrder
    .map((t) => ({
      label: t.label,
      items: registry.items.filter((i) => i.type === t.type),
    }))
    .filter((s) => s.items.length > 0);

  let copiedName = $state<string | null>(null);

  async function copyCommand(name: string) {
    const cmd = `npx shadcn-svelte@latest add ${baseUrl}/r/${name}.json`;
    await navigator.clipboard.writeText(cmd);
    copiedName = name;
    setTimeout(() => (copiedName = null), 2000);
  }

  // Preview data
  const sampleMetrics = [
    { value: 1234, format: 'number' as const, emoji: '👥', title: 'Total Users' },
    { value: 56780, format: 'currency' as const, emoji: '💰', title: 'Revenue', description: 'This month' },
    { value: 145, format: 'duration' as const, emoji: '⏱️', title: 'Avg. Session' },
  ];

  const selectOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const buttonGroupOptions = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
  ];

  const sampleJson = {
    name: 'HanovaTech',
    version: '1.0.0',
    components: 12,
    features: ['i18n', 'URL sync', 'dark mode'],
    config: { theme: 'neutral', framework: 'SvelteKit' },
  };

  let sheetFormOpen = $state(false);
  let sheetDetailOpen = $state(false);

  const previewComponents: Record<string, boolean> = {
    'page-header': true,
    'pagination': true,
    'search-filter': true,
    'select-filter': true,
    'button-group-filter': true,
    'date-range-filter': true,
    'month-filter': true,
    'metrics': true,
    'sheet-form': true,
    'navigation-tabs': true,
    'json-tree': true,
  };
</script>

<div class="mx-auto max-w-4xl px-6 py-16">
  <header class="space-y-4">
    <div class="flex items-center gap-3">
      <h1 class="text-4xl font-bold tracking-tight">HanovaTech UI Registry</h1>
    </div>
    <p class="text-lg text-muted-foreground">
      Custom components for
      <a href="https://next.shadcn-svelte.com" target="_blank" rel="noopener noreferrer" class="font-medium text-foreground underline underline-offset-4 hover:text-primary">shadcn-svelte</a>
      + SvelteKit. Install any component with the CLI:
    </p>
    <pre class="overflow-x-auto rounded-lg border bg-muted px-4 py-3 text-sm"><code>npx shadcn-svelte@latest add {baseUrl}/r/component-name.json</code></pre>
    <div class="flex items-center gap-4 text-xs text-muted-foreground">
      <span>{totalItems} components</span>
      <span>&middot;</span>
      <span>Built {buildDate}</span>
      <span>&middot;</span>
      <a href={resolve('/llms.txt')} class="underline underline-offset-4 hover:text-foreground">llms.txt</a>
    </div>
  </header>

  {#each sections as section}
    <div class="mt-12 space-y-4">
      <h2 class="text-2xl font-semibold tracking-tight">{section.label}</h2>
      <div class="grid gap-6">
        {#each section.items as component (component.name)}
          <div class="rounded-lg border">
            <div class="p-4">
              <div class="flex items-center justify-between">
                <h3 class="font-medium">{component.title}</h3>
                <code class="text-xs text-muted-foreground">{component.name}</code>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">{component.description}</p>
              <div class="mt-3 flex items-center gap-2">
                <code class="flex-1 truncate rounded border bg-muted px-2 py-1 text-xs text-muted-foreground">npx shadcn-svelte@latest add {baseUrl}/r/{component.name}.json</code>
                <button
                  onclick={() => copyCommand(component.name)}
                  class="shrink-0 rounded border px-2 py-1 text-xs transition-colors hover:bg-accent"
                >
                  {copiedName === component.name ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {#if browser && previewComponents[component.name]}
              <div class="border-t bg-muted/30 p-6">
                {#if component.name === 'page-header'}
                  <PageHeader title="Dashboard" description="Overview of your account activity." icon="📊" />

                {:else if component.name === 'pagination'}
                  <Pagination total={95} perPage={10} />

                {:else if component.name === 'search-filter'}
                  <SearchFilter />

                {:else if component.name === 'select-filter'}
                  <SelectFilter key="status" options={selectOptions} placeholder="Status" />

                {:else if component.name === 'button-group-filter'}
                  <ButtonGroupFilter key="type" options={buttonGroupOptions} defaultValue="all" />

                {:else if component.name === 'date-range-filter'}
                  <DateRangeFilter showYearNavigation />

                {:else if component.name === 'month-filter'}
                  <MonthFilter />

                {:else if component.name === 'metrics'}
                  <Metrics metrics={sampleMetrics} columns={3} />

                {:else if component.name === 'sheet-form'}
                  <div class="flex gap-2">
                    <Button variant="outline" onclick={() => (sheetFormOpen = true)}>Open Sheet Form</Button>
                    <Button variant="outline" onclick={() => (sheetDetailOpen = true)}>Open Sheet Detail</Button>
                  </div>
                  <SheetForm bind:open={sheetFormOpen} title="Edit User" description="Update user details." onSubmit={(e) => { e.preventDefault(); sheetFormOpen = false; }}>
                    <SheetFormSection title="Personal Info">
                      <p class="text-sm text-muted-foreground">Form fields go here.</p>
                    </SheetFormSection>
                  </SheetForm>
                  <SheetDetail bind:open={sheetDetailOpen} title="User Details" description="Read-only view.">
                    <p class="text-sm text-muted-foreground">Detail content goes here.</p>
                  </SheetDetail>

                {:else if component.name === 'navigation-tabs'}
                  <NavigationTabs tabs={[{ label: 'Overview', href: '/' }, { label: 'Settings', href: '/settings' }]}>
                    <p class="text-sm text-muted-foreground">Tab content goes here.</p>
                  </NavigationTabs>

                {:else if component.name === 'json-tree'}
                  <JsonTree data={sampleJson} />
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
