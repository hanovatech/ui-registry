<script lang="ts">
  import { Search, Filter, Plus, Package, ArrowUpDown } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';

  const metrics = [
    { value: 486, format: 'number' as const, emoji: '📦', title: 'Produkte', description: 'Im Katalog' },
    { value: 38, format: 'number' as const, emoji: '🆕', title: 'Neu hinzugefügt', description: 'Letzte 30 Tage' },
    { value: 12, format: 'number' as const, emoji: '⚠️', title: 'Niedriger Bestand', description: 'Nachbestellen' },
    { value: 97.8, format: 'percentage' as const, emoji: '✅', title: 'Verfügbarkeit', description: 'Lieferbereit' },
  ];

  function formatEUR(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
  }

  function bestandColor(bestand: number): string {
    if (bestand <= 10) return 'text-red-600 font-medium';
    if (bestand <= 50) return 'text-amber-600';
    return 'text-muted-foreground';
  }

  function statusLabel(aktiv: boolean): { text: string; class: string } {
    return aktiv
      ? { text: 'Aktiv', class: 'bg-emerald-100 text-emerald-800' }
      : { text: 'Inaktiv', class: 'bg-muted text-muted-foreground' };
  }

  const produkte = [
    { sku: 'ISP-X1-001', name: 'Industriesensor Pro X1', kategorie: 'Sensorik', preis: 1249.00, bestand: 87, verkauft: 342, aktiv: true },
    { sku: 'SM-400-002', name: 'Steuerungsmodul SM-400', kategorie: 'Steuerung', preis: 2890.00, bestand: 34, verkauft: 218, aktiv: true },
    { sku: 'NT-2000-003', name: 'Netzteil NT-2000', kategorie: 'Stromversorgung', preis: 459.90, bestand: 156, verkauft: 567, aktiv: true },
    { sku: 'VK-10-004', name: 'Verbindungskabel Set VK-10', kategorie: 'Zubehör', preis: 89.90, bestand: 412, verkauft: 1230, aktiv: true },
    { sku: 'MP-STD-005', name: 'Montageplatte MP-Standard', kategorie: 'Zubehör', preis: 149.00, bestand: 8, verkauft: 890, aktiv: true },
    { sku: 'TMP-300-006', name: 'Temperatursensor TMP-300', kategorie: 'Sensorik', preis: 689.00, bestand: 62, verkauft: 445, aktiv: true },
    { sku: 'DRV-750-007', name: 'Antriebsmodul DRV-750', kategorie: 'Antrieb', preis: 3450.00, bestand: 5, verkauft: 89, aktiv: true },
    { sku: 'PLC-100-008', name: 'SPS-Controller PLC-100', kategorie: 'Steuerung', preis: 1890.00, bestand: 43, verkauft: 167, aktiv: true },
    { sku: 'HMI-12-009', name: 'Touchpanel HMI-12"', kategorie: 'Bedienung', preis: 2190.00, bestand: 28, verkauft: 134, aktiv: true },
    { sku: 'KBL-CAT6-010', name: 'Netzwerkkabel Cat6 (50m)', kategorie: 'Zubehör', preis: 34.90, bestand: 780, verkauft: 2340, aktiv: true },
    { sku: 'PSU-500-011', name: 'Schaltnetzteil PSU-500W', kategorie: 'Stromversorgung', preis: 289.00, bestand: 3, verkauft: 456, aktiv: true },
    { sku: 'ENC-ABS-012', name: 'Absolutwertgeber ENC-ABS', kategorie: 'Sensorik', preis: 1750.00, bestand: 0, verkauft: 78, aktiv: false },
  ];
</script>

<svelte:head>
  <title>Produkte — HanovaTech</title>
</svelte:head>

<Metrics {metrics} columns={4} />

<!-- Filters -->
<div class="mt-8 flex items-center gap-3 rounded-xl border bg-card p-2 shadow-sm">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <input type="text" placeholder="Produkt oder SKU suchen…" class="h-9 w-full rounded-lg bg-muted/50 pl-9 pr-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:bg-background focus:ring-2" />
  </div>
  <div class="flex items-center gap-1.5">
    <button class="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Filter class="size-3.5" />
      Kategorie
    </button>
    <button class="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
      <Plus class="size-3.5" />
      Neues Produkt
    </button>
  </div>
</div>

<!-- Table -->
<Card.Root class="mt-6">
  <Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">SKU</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Produkt</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Kategorie</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">
              <button class="flex items-center gap-1 ml-auto">Preis <ArrowUpDown class="size-3" /></button>
            </th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">
              <button class="flex items-center gap-1 ml-auto">Bestand <ArrowUpDown class="size-3" /></button>
            </th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Verkauft</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each produkte as produkt}
            {@const status = statusLabel(produkt.aktiv)}
            <tr class="border-b transition-colors hover:bg-muted/30 cursor-pointer">
              <td class="px-6 py-3 font-mono text-xs">{produkt.sku}</td>
              <td class="px-6 py-3">
                <div class="flex items-center gap-2">
                  <Package class="size-4 text-muted-foreground" />
                  <span class="font-medium">{produkt.name}</span>
                </div>
              </td>
              <td class="px-6 py-3 text-muted-foreground">{produkt.kategorie}</td>
              <td class="px-6 py-3 text-right font-medium">{formatEUR(produkt.preis)}</td>
              <td class="px-6 py-3 text-right {bestandColor(produkt.bestand)}">
                {produkt.bestand === 0 ? 'Ausverkauft' : produkt.bestand}
              </td>
              <td class="px-6 py-3 text-right text-muted-foreground">{new Intl.NumberFormat('de-DE').format(produkt.verkauft)}</td>
              <td class="px-6 py-3">
                <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {status.class}">{status.text}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content>
  <Card.Footer class="justify-between text-xs text-muted-foreground">
    <span>Zeige 1–12 von 486 Produkten</span>
    <span>Seite 1 von 41</span>
  </Card.Footer>
</Card.Root>
