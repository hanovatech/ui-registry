<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    BarChart3,
    Settings,
    FileText,
    Search,
    ChevronDown,
    Bell,
    CalendarDays,
    Package,
    CreditCard,
  } from '@lucide/svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';

  let { children } = $props();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/demo' },
    { label: 'Bestellungen', icon: ShoppingCart, href: '/demo/bestellungen', badge: 12 },
    { label: 'Kunden', icon: Users, href: '/demo/kunden' },
    { label: 'Produkte', icon: Package, href: '/demo/produkte' },
    { label: 'Rechnungen', icon: CreditCard, href: '/demo/rechnungen' },
    { label: 'Berichte', icon: BarChart3, href: '/demo/berichte' },
    { label: 'Dokumente', icon: FileText, href: '/demo/dokumente' },
  ];

  const navFooter = [
    { label: 'Einstellungen', icon: Settings, href: '/demo' },
  ];

  function isActive(href: string): boolean {
    const path = page.url.pathname;
    if (href === '/demo') return path === resolve('/demo');
    return path.startsWith(resolve(href));
  }

  // Page title mapping
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/demo': { title: 'Dashboard', subtitle: 'Willkommen zurück, Anna' },
    '/demo/bestellungen': { title: 'Bestellungen', subtitle: 'Alle Bestellungen verwalten' },
    '/demo/kunden': { title: 'Kunden', subtitle: 'Kundenstamm und Kontaktdaten' },
    '/demo/produkte': { title: 'Produkte', subtitle: 'Produktkatalog und Lagerbestand' },
    '/demo/rechnungen': { title: 'Rechnungen', subtitle: 'Rechnungen und Zahlungsstatus' },
    '/demo/berichte': { title: 'Berichte', subtitle: 'Analysen und Auswertungen' },
    '/demo/dokumente': { title: 'Dokumente', subtitle: 'Dateien und Vorlagen' },
  };

  const currentPage = $derived(pageTitles[page.url.pathname.replace(resolve('/'), '/')] ?? pageTitles['/demo']);
</script>

<div class="flex h-screen bg-background">
  <!-- Sidebar -->
  <aside class="flex w-64 shrink-0 flex-col border-r border-l-[3px] border-l-blue-600 bg-sidebar">
    <!-- Logo -->
    <div class="flex h-16 items-center gap-3 px-6">
      <div class="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
        HT
      </div>
      <div>
        <p class="text-sm font-semibold text-sidebar-foreground">HanovaTech</p>
        <p class="text-xs text-muted-foreground">Verwaltung</p>
      </div>
    </div>

    <Separator />

    <!-- Search -->
    <div class="px-4 py-3">
      <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
        <Search class="size-4" />
        <span>Suchen…</span>
        <kbd class="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-3">
      <p class="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Navigation</p>
      {#each navItems as item}
        <a
          href={resolve(item.href)}
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
            {isActive(item.href) ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
        >
          <item.icon class="size-4" />
          <span>{item.label}</span>
          {#if item.badge}
            <span class="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">{item.badge}</span>
          {/if}
        </a>
      {/each}
    </nav>

    <Separator />

    <!-- Footer nav -->
    <div class="space-y-1 px-3 py-3">
      {#each navFooter as item}
        <a href={resolve(item.href)} class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
          <item.icon class="size-4" />
          <span>{item.label}</span>
        </a>
      {/each}
    </div>

    <!-- User -->
    <div class="border-t px-4 py-3">
      <div class="flex items-center gap-3">
        <div class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">AK</div>
        <div class="flex-1 truncate">
          <p class="truncate text-sm font-medium">Anna Krüger</p>
          <p class="truncate text-xs text-muted-foreground">anna@hanovatech.de</p>
        </div>
        <ChevronDown class="size-4 text-muted-foreground" />
      </div>
    </div>
  </aside>

  <!-- Main content -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Top bar -->
    <header class="flex h-16 items-center justify-between border-b px-8">
      <div>
        <h1 class="text-xl font-semibold">{currentPage.title}</h1>
        <p class="text-sm text-muted-foreground">{currentPage.subtitle}</p>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground">
          <CalendarDays class="mr-1 inline size-4" />
          {new Date(2026, 3, 17).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button class="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent">
          <Bell class="size-5" />
          <span class="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive"></span>
        </button>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1 overflow-y-auto p-8">
      {@render children()}
    </main>
  </div>
</div>
