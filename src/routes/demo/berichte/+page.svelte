<script lang="ts">
  import { TrendingUp, TrendingDown } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';

  const metrics = [
    { value: 2847600, format: 'currency' as const, emoji: '💰', title: 'Jahresumsatz', description: '+22,4% zum Vorjahr' },
    { value: 18420, format: 'number' as const, emoji: '📦', title: 'Bestellungen (Jahr)', description: '+15,8% zum Vorjahr' },
    { value: 154.30, format: 'currency' as const, emoji: '📊', title: 'Ø Bestellwert', description: '+4,2% zum Vorjahr' },
    { value: 12.4, format: 'percentage' as const, emoji: '📈', title: 'Wachstumsrate', description: 'Letzte 12 Monate' },
  ];

  function formatEUR(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  function formatDE(value: number): string {
    return new Intl.NumberFormat('de-DE').format(value);
  }

  // Quarterly revenue
  const quartale = [
    { label: 'Q1 2025', umsatz: 524000, bestellungen: 3210 },
    { label: 'Q2 2025', umsatz: 598000, bestellungen: 3780 },
    { label: 'Q3 2025', umsatz: 612000, bestellungen: 4020 },
    { label: 'Q4 2025', umsatz: 689000, bestellungen: 4340 },
    { label: 'Q1 2026', umsatz: 715000, bestellungen: 4520 },
    { label: 'Q2 2026*', umsatz: 248000, bestellungen: 1847 },
  ];
  const maxQuartal = Math.max(...quartale.map(q => q.umsatz));

  // Category performance
  const kategorien = [
    { name: 'Sensorik', umsatz: 842000, anteil: 29.6, trend: '+18%', up: true },
    { name: 'Steuerung', umsatz: 698000, anteil: 24.5, trend: '+12%', up: true },
    { name: 'Stromversorgung', umsatz: 456000, anteil: 16.0, trend: '+8%', up: true },
    { name: 'Antrieb', umsatz: 389000, anteil: 13.7, trend: '+25%', up: true },
    { name: 'Bedienung', umsatz: 287000, anteil: 10.1, trend: '-2%', up: false },
    { name: 'Zubehör', umsatz: 175600, anteil: 6.1, trend: '+5%', up: true },
  ];

  // Regional data
  const regionen = [
    { region: 'Norddeutschland', kunden: 842, umsatz: 624000, anteil: 21.9 },
    { region: 'Süddeutschland', kunden: 1120, umsatz: 896000, anteil: 31.5 },
    { region: 'Westdeutschland', kunden: 756, umsatz: 578000, anteil: 20.3 },
    { region: 'Ostdeutschland', kunden: 489, umsatz: 412000, anteil: 14.5 },
    { region: 'Österreich', kunden: 145, umsatz: 198000, anteil: 7.0 },
    { region: 'Schweiz', kunden: 77, umsatz: 139600, anteil: 4.8 },
  ];

  // Donut chart segments for categories
  const donutData = kategorien.map((k, i) => ({ ...k, color: [`fill-chart-1`, `fill-chart-2`, `fill-chart-3`, `fill-chart-4`, `fill-chart-5`, `fill-muted-foreground`][i] }));

  // SVG donut
  const donutRadius = 80;
  const donutStroke = 24;
  const donutCircumference = 2 * Math.PI * donutRadius;

  let cumulativeOffset = 0;
  const donutSegments = donutData.map(d => {
    const length = (d.anteil / 100) * donutCircumference;
    const offset = cumulativeOffset;
    cumulativeOffset += length;
    return { ...d, length, offset };
  });

  // Horizontal bar chart dimensions
  const hBarWidth = 600;
  const hBarHeight = 200;
  const hBarPadding = { top: 10, right: 20, bottom: 10, left: 100 };
  const hPlotWidth = hBarWidth - hBarPadding.left - hBarPadding.right;
  const hBarItemHeight = (hBarHeight - hBarPadding.top - hBarPadding.bottom) / quartale.length;
</script>

<svelte:head>
  <title>Berichte — HanovaTech</title>
</svelte:head>

<Metrics {metrics} columns={4} />

<div class="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
  <!-- Quarterly revenue chart -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Quartalsumsatz</Card.Title>
      <Card.Description>Umsatzentwicklung nach Quartal</Card.Description>
    </Card.Header>
    <Card.Content>
      <svg viewBox="0 0 {hBarWidth} {hBarHeight}" class="w-full" preserveAspectRatio="xMidYMid meet">
        {#each quartale as q, i}
          {@const barW = (q.umsatz / maxQuartal) * hPlotWidth}
          {@const y = hBarPadding.top + i * hBarItemHeight + 4}
          {@const barH = hBarItemHeight - 8}
          <text x={hBarPadding.left - 8} y={y + barH / 2 + 4} text-anchor="end" class="fill-muted-foreground text-[12px]">{q.label}</text>
          <rect x={hBarPadding.left} {y} width={barW} height={barH} rx="4" class={i === quartale.length - 1 ? 'fill-chart-1/40' : 'fill-chart-1'} />
          <text x={hBarPadding.left + barW + 8} y={y + barH / 2 + 4} class="fill-foreground text-[11px] font-medium">{formatEUR(q.umsatz)}</text>
        {/each}
      </svg>
    </Card.Content>
  </Card.Root>

  <!-- Category donut -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Umsatz nach Kategorie</Card.Title>
      <Card.Description>Verteilung im aktuellen Geschäftsjahr</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center gap-8">
        <svg viewBox="0 0 200 200" class="size-44 shrink-0">
          {#each donutSegments as seg}
            <circle
              cx="100" cy="100" r={donutRadius}
              fill="none"
              stroke-width={donutStroke}
              class={seg.color.replace('fill-', 'stroke-')}
              stroke-dasharray="{seg.length} {donutCircumference - seg.length}"
              stroke-dashoffset={-seg.offset}
              transform="rotate(-90 100 100)"
            />
          {/each}
          <text x="100" y="96" text-anchor="middle" class="fill-foreground text-[14px] font-bold">6 Kat.</text>
          <text x="100" y="112" text-anchor="middle" class="fill-muted-foreground text-[10px]">486 Produkte</text>
        </svg>
        <div class="flex-1 space-y-2">
          {#each donutData as k}
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="size-3 rounded-sm {k.color}"></div>
                <span>{k.name}</span>
              </div>
              <span class="font-medium">{k.anteil.toLocaleString('de-DE')}%</span>
            </div>
          {/each}
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</div>

<!-- Category performance table -->
<Card.Root class="mt-8">
  <Card.Header>
    <Card.Title>Kategorieperformance</Card.Title>
    <Card.Description>Detailansicht aller Produktkategorien</Card.Description>
  </Card.Header>
  <Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Kategorie</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Umsatz</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Anteil</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Verlauf</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Trend</th>
          </tr>
        </thead>
        <tbody>
          {#each kategorien as k}
            <tr class="border-b transition-colors hover:bg-muted/30">
              <td class="px-6 py-3 font-medium">{k.name}</td>
              <td class="px-6 py-3 text-right font-medium">{formatEUR(k.umsatz)}</td>
              <td class="px-6 py-3 text-right text-muted-foreground">{k.anteil.toLocaleString('de-DE')}%</td>
              <td class="px-6 py-3">
                <div class="h-2 w-full rounded-full bg-muted">
                  <div class="h-2 rounded-full bg-chart-1" style="width: {k.anteil}%"></div>
                </div>
              </td>
              <td class="px-6 py-3 text-right">
                <div class="flex items-center justify-end gap-1 {k.up ? 'text-emerald-600' : 'text-red-500'}">
                  {#if k.up}
                    <TrendingUp class="size-3" />
                  {:else}
                    <TrendingDown class="size-3" />
                  {/if}
                  <span class="font-medium">{k.trend}</span>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content>
</Card.Root>

<!-- Regional breakdown -->
<Card.Root class="mt-8">
  <Card.Header>
    <Card.Title>Regionale Verteilung</Card.Title>
    <Card.Description>Kunden und Umsatz nach Region</Card.Description>
  </Card.Header>
  <Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Region</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Kunden</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Umsatz</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Anteil</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Verlauf</th>
          </tr>
        </thead>
        <tbody>
          {#each regionen as r}
            <tr class="border-b transition-colors hover:bg-muted/30">
              <td class="px-6 py-3 font-medium">{r.region}</td>
              <td class="px-6 py-3 text-right text-muted-foreground">{formatDE(r.kunden)}</td>
              <td class="px-6 py-3 text-right font-medium">{formatEUR(r.umsatz)}</td>
              <td class="px-6 py-3 text-right text-muted-foreground">{r.anteil.toLocaleString('de-DE')}%</td>
              <td class="px-6 py-3">
                <div class="h-2 w-full rounded-full bg-muted">
                  <div class="h-2 rounded-full bg-chart-2" style="width: {(r.anteil / 31.5) * 100}%"></div>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content>
</Card.Root>
