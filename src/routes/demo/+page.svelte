<script lang="ts">
  import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Activity,
  } from '@lucide/svelte';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';
  import * as Card from '$lib/components/ui/card/index.js';

  const metrics = [
    { value: 248390, format: 'currency' as const, emoji: '💰', title: 'Gesamtumsatz', description: 'Aktueller Monat' },
    { value: 1847, format: 'number' as const, emoji: '🛒', title: 'Bestellungen', description: '+12,5% zum Vormonat' },
    { value: 3429, format: 'number' as const, emoji: '👥', title: 'Aktive Kunden', description: '+8,3% zum Vormonat' },
    { value: 68.4, format: 'percentage' as const, emoji: '📈', title: 'Konversionsrate', description: '+2,1 Prozentpunkte' },
  ];

  const chartData = [
    { month: 'Mai', value: 142000 },
    { month: 'Jun', value: 158000 },
    { month: 'Jul', value: 134000 },
    { month: 'Aug', value: 171000 },
    { month: 'Sep', value: 189000 },
    { month: 'Okt', value: 203000 },
    { month: 'Nov', value: 195000 },
    { month: 'Dez', value: 231000 },
    { month: 'Jan', value: 218000 },
    { month: 'Feb', value: 226000 },
    { month: 'Mär', value: 241000 },
    { month: 'Apr', value: 248000 },
  ];

  const maxChartValue = Math.max(...chartData.map((d) => d.value));

  function formatEUR(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  function formatDE(value: number): string {
    return new Intl.NumberFormat('de-DE').format(value);
  }

  const orders = [
    { id: 'BES-2024-1847', kunde: 'Müller GmbH', datum: new Date(2026, 3, 17, 14, 23), betrag: 12450.0, status: 'Abgeschlossen', produkte: 8 },
    { id: 'BES-2024-1846', kunde: 'Schmidt & Partner AG', datum: new Date(2026, 3, 17, 11, 5), betrag: 8920.5, status: 'In Bearbeitung', produkte: 3 },
    { id: 'BES-2024-1845', kunde: 'Weber Logistik KG', datum: new Date(2026, 3, 16, 16, 42), betrag: 23100.0, status: 'Abgeschlossen', produkte: 15 },
    { id: 'BES-2024-1844', kunde: 'Fischer Elektronik e.K.', datum: new Date(2026, 3, 16, 9, 18), betrag: 4670.8, status: 'Versendet', produkte: 2 },
    { id: 'BES-2024-1843', kunde: 'Bauer Industrietechnik', datum: new Date(2026, 3, 15, 13, 55), betrag: 31200.0, status: 'Abgeschlossen', produkte: 22 },
    { id: 'BES-2024-1842', kunde: 'Koch Medizintechnik GmbH', datum: new Date(2026, 3, 15, 8, 30), betrag: 17890.25, status: 'In Bearbeitung', produkte: 7 },
    { id: 'BES-2024-1841', kunde: 'Becker Software Solutions', datum: new Date(2026, 3, 14, 15, 12), betrag: 5430.0, status: 'Versendet', produkte: 4 },
    { id: 'BES-2024-1840', kunde: 'Hoffmann Maschinenbau AG', datum: new Date(2026, 3, 14, 10, 47), betrag: 42600.0, status: 'Abgeschlossen', produkte: 18 },
  ];

  function formatDatum(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
  }

  function formatBetrag(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'Abgeschlossen': return 'bg-emerald-100 text-emerald-800';
      case 'In Bearbeitung': return 'bg-amber-100 text-amber-800';
      case 'Versendet': return 'bg-blue-100 text-blue-800';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  const chartWidth = 700;
  const chartHeight = 260;
  const chartPadding = { top: 20, right: 20, bottom: 30, left: 60 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const barWidth = plotWidth / chartData.length - 8;
  const yTicks = [0, 50000, 100000, 150000, 200000, 250000];
</script>

<svelte:head>
  <title>Dashboard — HanovaTech</title>
</svelte:head>

<!-- Metrics -->
<Metrics {metrics} columns={4} />

<div class="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-5">
  <!-- Chart -->
  <Card.Root class="xl:col-span-3">
    <Card.Header>
      <div class="flex items-center justify-between">
        <div>
          <Card.Title>Umsatzentwicklung</Card.Title>
          <Card.Description>Monatlicher Umsatz der letzten 12 Monate</Card.Description>
        </div>
        <div class="flex items-center gap-1 text-sm font-medium text-emerald-600">
          <TrendingUp class="size-4" />
          +18,2%
        </div>
      </div>
    </Card.Header>
    <Card.Content>
      <svg viewBox="0 0 {chartWidth} {chartHeight}" class="w-full" preserveAspectRatio="xMidYMid meet">
        {#each yTicks as tick}
          {@const y = chartPadding.top + plotHeight - (tick / maxChartValue) * plotHeight}
          <line x1={chartPadding.left} y1={y} x2={chartWidth - chartPadding.right} y2={y} stroke="currentColor" class="text-border" stroke-dasharray={tick === 0 ? '0' : '4,4'} />
          <text x={chartPadding.left - 8} y={y + 4} text-anchor="end" class="fill-muted-foreground text-[11px]">
            {tick === 0 ? '0' : formatDE(tick / 1000) + 'k'}
          </text>
        {/each}
        {#each chartData as d, i}
          {@const barHeight = (d.value / maxChartValue) * plotHeight}
          {@const x = chartPadding.left + i * (plotWidth / chartData.length) + 4}
          {@const y = chartPadding.top + plotHeight - barHeight}
          <rect {x} {y} width={barWidth} height={barHeight} rx="4" class={i === chartData.length - 1 ? 'fill-chart-1' : 'fill-chart-1/60'} />
          <text x={x + barWidth / 2} y={chartHeight - 8} text-anchor="middle" class="fill-muted-foreground text-[11px]">{d.month}</text>
        {/each}
      </svg>
    </Card.Content>
  </Card.Root>

  <!-- Top products -->
  <Card.Root class="xl:col-span-2">
    <Card.Header>
      <Card.Title>Top-Produkte</Card.Title>
      <Card.Description>Meistverkauft im April</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="space-y-4">
        {#each [
          { name: 'Industriesensor Pro X1', umsatz: 48200, trend: '+23%', up: true },
          { name: 'Steuerungsmodul SM-400', umsatz: 35800, trend: '+15%', up: true },
          { name: 'Netzteil NT-2000', umsatz: 28400, trend: '+8%', up: true },
          { name: 'Verbindungskabel Set VK-10', umsatz: 21900, trend: '-3%', up: false },
          { name: 'Montageplatte MP-Standard', umsatz: 18600, trend: '+5%', up: true },
        ] as product}
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-medium">{product.name}</p>
              <p class="text-xs text-muted-foreground">{formatEUR(product.umsatz)}</p>
            </div>
            <div class="flex items-center gap-1 text-sm {product.up ? 'text-emerald-600' : 'text-red-500'}">
              {#if product.up}
                <TrendingUp class="size-3" />
              {:else}
                <TrendingDown class="size-3" />
              {/if}
              <span class="font-medium">{product.trend}</span>
            </div>
          </div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>
</div>

<!-- Orders table -->
<Card.Root class="mt-8">
  <Card.Header>
    <div class="flex items-center justify-between">
      <div>
        <Card.Title>Letzte Bestellungen</Card.Title>
        <Card.Description>Übersicht der neuesten Bestellungen</Card.Description>
      </div>
      <a href="/demo/bestellungen" class="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent">
        Alle anzeigen
        <ArrowUpRight class="size-3" />
      </a>
    </div>
  </Card.Header>
  <Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Bestellnr.</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Kunde</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Datum</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Produkte</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Betrag</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each orders as order}
            <tr class="border-b transition-colors hover:bg-muted/30">
              <td class="px-6 py-3 font-mono text-xs">{order.id}</td>
              <td class="px-6 py-3 font-medium">{order.kunde}</td>
              <td class="px-6 py-3 text-muted-foreground">{formatDatum(order.datum)}</td>
              <td class="px-6 py-3 text-right">{order.produkte}</td>
              <td class="px-6 py-3 text-right font-medium">{formatBetrag(order.betrag)}</td>
              <td class="px-6 py-3">
                <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusColor(order.status)}">{order.status}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content>
  <Card.Footer class="justify-between text-xs text-muted-foreground">
    <span>Zeige 1–8 von 1.847 Bestellungen</span>
    <span>Seite 1 von 231</span>
  </Card.Footer>
</Card.Root>

<div class="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
  <Activity class="size-3" />
  <span>Letzte Aktualisierung: heute, {new Date(2026, 3, 17, 14, 35).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
</div>
