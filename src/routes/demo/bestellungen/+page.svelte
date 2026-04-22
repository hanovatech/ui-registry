<script lang="ts">
  import { Search, Filter, Download, ArrowUpDown } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';

  const metrics = [
    { value: 1847, format: 'number' as const, emoji: '📦', title: 'Gesamt', description: 'Alle Bestellungen' },
    { value: 342, format: 'number' as const, emoji: '⏳', title: 'In Bearbeitung', description: '18,5% aller Bestellungen' },
    { value: 1289, format: 'number' as const, emoji: '✅', title: 'Abgeschlossen', description: '69,8% aller Bestellungen' },
    { value: 216, format: 'number' as const, emoji: '🚚', title: 'Versendet', description: '11,7% aller Bestellungen' },
  ];

  function formatBetrag(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
  }

  function formatDatum(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'Abgeschlossen': return 'bg-emerald-100 text-emerald-800';
      case 'In Bearbeitung': return 'bg-amber-100 text-amber-800';
      case 'Versendet': return 'bg-blue-100 text-blue-800';
      case 'Storniert': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  const orders = [
    { id: 'BES-2024-1847', kunde: 'Müller GmbH', datum: new Date(2026, 3, 17, 14, 23), betrag: 12450.00, status: 'Abgeschlossen', produkte: 8, zahlungsart: 'Rechnung' },
    { id: 'BES-2024-1846', kunde: 'Schmidt & Partner AG', datum: new Date(2026, 3, 17, 11, 5), betrag: 8920.50, status: 'In Bearbeitung', produkte: 3, zahlungsart: 'Vorkasse' },
    { id: 'BES-2024-1845', kunde: 'Weber Logistik KG', datum: new Date(2026, 3, 16, 16, 42), betrag: 23100.00, status: 'Abgeschlossen', produkte: 15, zahlungsart: 'Rechnung' },
    { id: 'BES-2024-1844', kunde: 'Fischer Elektronik e.K.', datum: new Date(2026, 3, 16, 9, 18), betrag: 4670.80, status: 'Versendet', produkte: 2, zahlungsart: 'Kreditkarte' },
    { id: 'BES-2024-1843', kunde: 'Bauer Industrietechnik', datum: new Date(2026, 3, 15, 13, 55), betrag: 31200.00, status: 'Abgeschlossen', produkte: 22, zahlungsart: 'Rechnung' },
    { id: 'BES-2024-1842', kunde: 'Koch Medizintechnik GmbH', datum: new Date(2026, 3, 15, 8, 30), betrag: 17890.25, status: 'In Bearbeitung', produkte: 7, zahlungsart: 'Lastschrift' },
    { id: 'BES-2024-1841', kunde: 'Becker Software Solutions', datum: new Date(2026, 3, 14, 15, 12), betrag: 5430.00, status: 'Versendet', produkte: 4, zahlungsart: 'Vorkasse' },
    { id: 'BES-2024-1840', kunde: 'Hoffmann Maschinenbau AG', datum: new Date(2026, 3, 14, 10, 47), betrag: 42600.00, status: 'Abgeschlossen', produkte: 18, zahlungsart: 'Rechnung' },
    { id: 'BES-2024-1839', kunde: 'Schäfer Bauteile GmbH', datum: new Date(2026, 3, 13, 9, 33), betrag: 6780.00, status: 'Storniert', produkte: 5, zahlungsart: 'Kreditkarte' },
    { id: 'BES-2024-1838', kunde: 'Klein Automatisierung', datum: new Date(2026, 3, 12, 14, 20), betrag: 19450.00, status: 'Abgeschlossen', produkte: 11, zahlungsart: 'Rechnung' },
    { id: 'BES-2024-1837', kunde: 'Wolf Präzisionstechnik', datum: new Date(2026, 3, 12, 10, 15), betrag: 8340.60, status: 'Versendet', produkte: 6, zahlungsart: 'Lastschrift' },
    { id: 'BES-2024-1836', kunde: 'Neumann Elektro AG', datum: new Date(2026, 3, 11, 16, 8), betrag: 27900.00, status: 'Abgeschlossen', produkte: 14, zahlungsart: 'Rechnung' },
  ];
</script>

<svelte:head>
  <title>Bestellungen — HanovaTech</title>
</svelte:head>

<Metrics {metrics} columns={4} />

<!-- Filters -->
<div class="mt-8 flex items-center gap-3 rounded-xl border bg-card p-2 shadow-sm">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <input type="text" placeholder="Bestellung suchen…" class="h-9 w-full rounded-lg bg-muted/50 pl-9 pr-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:bg-background focus:ring-2" />
  </div>
  <div class="flex items-center gap-1.5">
    <button class="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Filter class="size-3.5" />
      Filter
    </button>
    <button class="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Download class="size-3.5" />
      Exportieren
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
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">
              <button class="flex items-center gap-1">Bestellnr. <ArrowUpDown class="size-3" /></button>
            </th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Kunde</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">
              <button class="flex items-center gap-1">Datum <ArrowUpDown class="size-3" /></button>
            </th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Produkte</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Zahlungsart</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">
              <button class="flex items-center gap-1 ml-auto">Betrag <ArrowUpDown class="size-3" /></button>
            </th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each orders as order}
            <tr class="border-b transition-colors hover:bg-muted/30 cursor-pointer">
              <td class="px-6 py-3 font-mono text-xs">{order.id}</td>
              <td class="px-6 py-3 font-medium">{order.kunde}</td>
              <td class="px-6 py-3 text-muted-foreground">{formatDatum(order.datum)}</td>
              <td class="px-6 py-3 text-right">{order.produkte}</td>
              <td class="px-6 py-3 text-muted-foreground">{order.zahlungsart}</td>
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
    <span>Zeige 1–12 von 1.847 Bestellungen</span>
    <span>Seite 1 von 154</span>
  </Card.Footer>
</Card.Root>
