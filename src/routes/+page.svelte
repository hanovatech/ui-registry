<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import registry from '../registry.json';

  const baseUrl = $derived(`${page.url.origin}${resolve('/')}`.replace(/\/$/, ''));

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
</script>

<div class="mx-auto max-w-3xl px-6 py-16">
  <header class="space-y-4">
    <div class="flex items-center gap-3">
      <h1 class="text-4xl font-bold tracking-tight">HanovaTech UI Registry</h1>
    </div>
    <p class="text-lg text-muted-foreground">
      Custom components for
      <a href="https://next.shadcn-svelte.com" target="_blank" rel="noopener noreferrer" class="font-medium text-foreground underline underline-offset-4 hover:text-primary">shadcn-svelte</a>
      + SvelteKit. Install any component with the CLI:
    </p>
    <pre class="rounded-lg border bg-muted px-4 py-3 text-sm"><code>npx shadcn-svelte@latest add {baseUrl}/r/component-name.json</code></pre>
    <div class="flex items-center gap-4 text-xs text-muted-foreground">
      <span>{totalItems} components</span>
      <span>&middot;</span>
      <span>Built {buildDate}</span>
    </div>
  </header>

  {#each sections as section}
    <div class="mt-12 space-y-4">
      <h2 class="text-2xl font-semibold tracking-tight">{section.label}</h2>
      <div class="grid gap-3">
        {#each section.items as component (component.name)}
          <div class="group rounded-lg border p-4 transition-colors hover:bg-muted">
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
        {/each}
      </div>
    </div>
  {/each}
</div>
