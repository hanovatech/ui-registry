<script lang="ts">
  import { Search, Filter, Download, FileText, ArrowUpDown } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';

  const metrics = [
    { value: 892400, format: 'currency' as const, emoji: '💰', title: 'Gesamtbetrag', description: 'Alle Rechnungen Q2' },
    { value: 124, format: 'number' as const, emoji: '📄', title: 'Offene Rechnungen', description: 'Ausstehend' },
    { value: 38200, format: 'currency' as const, emoji: '⏰', title: 'Überfällig', description: '5 Rechnungen' },
    { value: 96.1, format: 'percentage' as const, emoji: '✅', title: 'Zahlungsquote', description: 'Pünktlich bezahlt' },
  ];

  function formatBetrag(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
  }

  function formatDatum(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function statusColor(status: string): string {
    switch (status) {
      case 'Bezahlt': return 'bg-emerald-100 text-emerald-800';
      case 'Offen': return 'bg-amber-100 text-amber-800';
      case 'Überfällig': return 'bg-red-100 text-red-800';
      case 'Entwurf': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  const rechnungen = [
    { nr: 'RE-2026-0412', kunde: 'Hoffmann Maschinenbau AG', ausgestellt: new Date(2026, 3, 14), faellig: new Date(2026, 4, 14), betrag: 42600.00, status: 'Offen' },
    { nr: 'RE-2026-0411', kunde: 'Bauer Industrietechnik', ausgestellt: new Date(2026, 3, 13), faellig: new Date(2026, 4, 13), betrag: 31200.00, status: 'Offen' },
    { nr: 'RE-2026-0410', kunde: 'Koch Medizintechnik GmbH', ausgestellt: new Date(2026, 3, 12), faellig: new Date(2026, 4, 12), betrag: 17890.25, status: 'Offen' },
    { nr: 'RE-2026-0409', kunde: 'Müller GmbH', ausgestellt: new Date(2026, 3, 10), faellig: new Date(2026, 4, 10), betrag: 12450.00, status: 'Bezahlt' },
    { nr: 'RE-2026-0408', kunde: 'Klein Automatisierung', ausgestellt: new Date(2026, 3, 8), faellig: new Date(2026, 4, 8), betrag: 19450.00, status: 'Bezahlt' },
    { nr: 'RE-2026-0407', kunde: 'Schmidt & Partner AG', ausgestellt: new Date(2026, 3, 5), faellig: new Date(2026, 4, 5), betrag: 8920.50, status: 'Bezahlt' },
    { nr: 'RE-2026-0406', kunde: 'Neumann Elektro AG', ausgestellt: new Date(2026, 2, 28), faellig: new Date(2026, 3, 28), betrag: 27900.00, status: 'Bezahlt' },
    { nr: 'RE-2026-0405', kunde: 'Weber Logistik KG', ausgestellt: new Date(2026, 2, 20), faellig: new Date(2026, 3, 20), betrag: 23100.00, status: 'Bezahlt' },
    { nr: 'RE-2026-0404', kunde: 'Wolf Präzisionstechnik', ausgestellt: new Date(2026, 2, 15), faellig: new Date(2026, 3, 15), betrag: 8340.60, status: 'Überfällig' },
    { nr: 'RE-2026-0403', kunde: 'Schäfer Bauteile GmbH', ausgestellt: new Date(2026, 2, 10), faellig: new Date(2026, 3, 10), betrag: 6780.00, status: 'Überfällig' },
    { nr: 'RE-2026-0402', kunde: 'Fischer Elektronik e.K.', ausgestellt: new Date(2026, 2, 5), faellig: new Date(2026, 3, 5), betrag: 14670.80, status: 'Bezahlt' },
    { nr: 'RE-2026-0401', kunde: 'Becker Software Solutions', ausgestellt: new Date(2026, 1, 28), faellig: new Date(2026, 2, 28), betrag: 5430.00, status: 'Bezahlt' },
  ];
</script>

<svelte:head>
  <title>Rechnungen — HanovaTech</title>
</svelte:head>

<Metrics {metrics} columns={4} />

<!-- Filters -->
<div class="mt-8 flex items-center gap-3 rounded-xl border bg-card p-2 shadow-sm">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <input type="text" placeholder="Rechnung oder Kunde suchen…" class="h-9 w-full rounded-lg bg-muted/50 pl-9 pr-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:bg-background focus:ring-2" />
  </div>
  <div class="flex items-center gap-1.5">
    <button class="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Filter class="size-3.5" />
      Status
    </button>
    <button class="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Download class="size-3.5" />
      Alle exportieren
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
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Rechnungsnr.</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Kunde</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">
              <button class="flex items-center gap-1">Ausgestellt <ArrowUpDown class="size-3" /></button>
            </th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Fällig am</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">
              <button class="flex items-center gap-1 ml-auto">Betrag <ArrowUpDown class="size-3" /></button>
            </th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-6 py-3 text-center font-medium text-muted-foreground">PDF</th>
          </tr>
        </thead>
        <tbody>
          {#each rechnungen as rechnung}
            <tr class="border-b transition-colors hover:bg-muted/30 cursor-pointer">
              <td class="px-6 py-3 font-mono text-xs">{rechnung.nr}</td>
              <td class="px-6 py-3 font-medium">{rechnung.kunde}</td>
              <td class="px-6 py-3 text-muted-foreground">{formatDatum(rechnung.ausgestellt)}</td>
              <td class="px-6 py-3 text-muted-foreground">{formatDatum(rechnung.faellig)}</td>
              <td class="px-6 py-3 text-right font-medium">{formatBetrag(rechnung.betrag)}</td>
              <td class="px-6 py-3">
                <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusColor(rechnung.status)}">{rechnung.status}</span>
              </td>
              <td class="px-6 py-3 text-center">
                <button class="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <FileText class="size-4" />
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content>
  <Card.Footer class="justify-between text-xs text-muted-foreground">
    <span>Zeige 1–12 von 892 Rechnungen</span>
    <span>Seite 1 von 75</span>
  </Card.Footer>
</Card.Root>
