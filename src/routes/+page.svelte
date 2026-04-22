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
  import TimeInput from '$lib/components/registry/time-input/time-input.svelte';
  import { buildBreadcrumbs } from '$lib/components/registry/breadcrumbs/index.js';
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
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
    'time-input': true,
    'breadcrumbs': true,
  };
</script>

<div class="min-h-screen bg-muted/50">
  <div class="mx-auto max-w-4xl px-6 py-16">
    <header class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-4xl font-bold tracking-tight">HanovaTech UI Registry</h1>
        <a href="https://github.com/hanovatech/ui-registry" target="_blank" rel="noopener noreferrer" class="text-muted-foreground transition-colors hover:text-foreground">
          <svg class="size-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          <span class="sr-only">GitHub</span>
        </a>
      </div>
      <p class="text-lg text-muted-foreground">
        Custom components for
        <a href="https://next.shadcn-svelte.com" target="_blank" rel="noopener noreferrer" class="font-medium text-foreground underline underline-offset-4 hover:text-primary">shadcn-svelte</a>
        + SvelteKit. Install any component with the CLI:
      </p>
      <pre class="max-w-full overflow-x-auto rounded-lg border bg-muted px-4 py-3 text-sm"><code>npx shadcn-svelte@latest add {baseUrl}/r/component-name.json</code></pre>
      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{totalItems} components</span>
        <span>&middot;</span>
        <span>Built {buildDate}</span>
        <span>&middot;</span>
        <a href={resolve('/llms.txt')} class="underline underline-offset-4 hover:text-foreground">llms.txt</a>
        <span>&middot;</span>
        <a href={resolve('/demo')} class="underline underline-offset-4 hover:text-foreground">Demo</a>
      </div>
    </header>

    {#each sections as section}
      <div class="mt-12 space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight">{section.label}</h2>
        <div class="grid gap-8">
          {#each section.items as component (component.name)}
            <Card.Root>
              <Card.Header>
                <div class="flex items-center justify-between">
                  <Card.Title>{component.title}</Card.Title>
                  <code class="text-xs text-muted-foreground">{component.name}</code>
                </div>
                <Card.Description>{component.description}</Card.Description>
                <div class="mt-1 flex items-center gap-2">
                  <code class="w-0 flex-1 truncate rounded border bg-muted px-2 py-1 text-xs text-muted-foreground">npx shadcn-svelte@latest add {baseUrl}/r/{component.name}.json</code>
                  <button
                    onclick={() => copyCommand(component.name)}
                    class="shrink-0 rounded border px-2 py-1 text-xs transition-colors hover:bg-accent"
                  >
                    {copiedName === component.name ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </Card.Header>

              {#if browser && previewComponents[component.name]}
                <div class="px-6">
                  <div class="rounded-lg border bg-muted/30 p-6">
                  {#if component.name === 'page-header'}
                    <PageHeader title="Dashboard" description="Overview of your account activity." icon="📊" />

                  {:else if component.name === 'pagination'}
                    <Pagination total={30} perPage={10} />

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
                    <NavigationTabs triggerClass="flex-1" tabs={[{ label: 'Overview', href: '/' }, { label: 'Analytics', href: '/?tab=analytics' }, { label: 'Settings', href: '/?tab=settings' }, { label: 'Billing', href: '/?tab=billing' }]}>
                      <p class="text-sm text-muted-foreground">Tab content goes here.</p>
                    </NavigationTabs>

                  {:else if component.name === 'json-tree'}
                    <JsonTree data={sampleJson} />

                  {:else if component.name === 'time-input'}
                    <div class="w-48">
                      <TimeInput />
                    </div>

                  {:else if component.name === 'breadcrumbs'}
                    {@const breadcrumbItems = buildBreadcrumbs({ pathname: '/dashboard/users/e1a2b3c4-5678-9abc-def0-1234567890ab', labels: { dashboard: 'Dashboard', users: 'Users' }, dynamicSegments: { users: { dataKey: 'user', property: 'name' } }, data: { user: { name: 'Jane Doe' } } })}
                    <nav>
                      <Breadcrumb.Root>
                        <Breadcrumb.List>
                          {#each breadcrumbItems as item, i (item.href)}
                            {#if i > 0}
                              <Breadcrumb.Separator />
                            {/if}
                            <Breadcrumb.Item>
                              {#if i === breadcrumbItems.length - 1}
                                <Breadcrumb.Page>{item.label}</Breadcrumb.Page>
                              {:else}
                                <Breadcrumb.Link href={item.href}>{item.label}</Breadcrumb.Link>
                              {/if}
                            </Breadcrumb.Item>
                          {/each}
                        </Breadcrumb.List>
                      </Breadcrumb.Root>
                    </nav>
                  {/if}
                  </div>
                </div>
              {/if}
            </Card.Root>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
