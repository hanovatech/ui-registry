<script lang="ts">
  import { Search, Filter, Plus, Mail, Phone, MapPin } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';

  const metrics = [
    { value: 3429, format: 'number' as const, emoji: '👥', title: 'Gesamtkunden', description: 'Aktive Konten' },
    { value: 284, format: 'number' as const, emoji: '🆕', title: 'Neukunden', description: 'Diesen Monat' },
    { value: 47200, format: 'currency' as const, emoji: '💰', title: 'Ø Kundenwert', description: 'Durchschn. Jahresumsatz' },
    { value: 94.2, format: 'percentage' as const, emoji: '🔄', title: 'Bindungsrate', description: '+1,8% zum Vorjahr' },
  ];

  function formatEUR(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  const kunden = [
    { name: 'Müller GmbH', kontakt: 'Thomas Müller', email: 'mueller@mueller-gmbh.de', telefon: '+49 511 123-4567', ort: 'Hannover', umsatz: 187400, bestellungen: 42, status: 'Premium' },
    { name: 'Schmidt & Partner AG', kontakt: 'Lisa Schmidt', email: 'l.schmidt@schmidt-partner.de', telefon: '+49 30 987-6543', ort: 'Berlin', umsatz: 142800, bestellungen: 31, status: 'Premium' },
    { name: 'Weber Logistik KG', kontakt: 'Martin Weber', email: 'weber@weber-logistik.de', telefon: '+49 40 555-1234', ort: 'Hamburg', umsatz: 98500, bestellungen: 24, status: 'Standard' },
    { name: 'Fischer Elektronik e.K.', kontakt: 'Sandra Fischer', email: 'info@fischer-elektronik.de', telefon: '+49 89 444-7890', ort: 'München', umsatz: 76200, bestellungen: 18, status: 'Standard' },
    { name: 'Bauer Industrietechnik', kontakt: 'Klaus Bauer', email: 'k.bauer@bauer-industrie.de', telefon: '+49 711 333-2211', ort: 'Stuttgart', umsatz: 234600, bestellungen: 56, status: 'Premium' },
    { name: 'Koch Medizintechnik GmbH', kontakt: 'Dr. Eva Koch', email: 'e.koch@koch-medtech.de', telefon: '+49 221 777-8899', ort: 'Köln', umsatz: 156300, bestellungen: 38, status: 'Premium' },
    { name: 'Becker Software Solutions', kontakt: 'Jan Becker', email: 'jan@becker-software.de', telefon: '+49 69 222-3344', ort: 'Frankfurt', umsatz: 45800, bestellungen: 12, status: 'Standard' },
    { name: 'Hoffmann Maschinenbau AG', kontakt: 'Peter Hoffmann', email: 'p.hoffmann@hoffmann-mb.de', telefon: '+49 351 666-5544', ort: 'Dresden', umsatz: 312500, bestellungen: 67, status: 'Enterprise' },
    { name: 'Schäfer Bauteile GmbH', kontakt: 'Monika Schäfer', email: 'schaefer@bauteile-schaefer.de', telefon: '+49 201 111-9988', ort: 'Essen', umsatz: 67400, bestellungen: 15, status: 'Standard' },
    { name: 'Klein Automatisierung', kontakt: 'Stefan Klein', email: 's.klein@klein-auto.de', telefon: '+49 911 888-7766', ort: 'Nürnberg', umsatz: 189700, bestellungen: 44, status: 'Premium' },
  ];

  function statusColor(status: string): string {
    switch (status) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Premium': return 'bg-blue-100 text-blue-800';
      case 'Standard': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  }
</script>

<svelte:head>
  <title>Kunden — HanovaTech</title>
</svelte:head>

<Metrics {metrics} columns={4} />

<!-- Filters -->
<div class="mt-8 flex items-center gap-3 rounded-xl border bg-card p-2 shadow-sm">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <input type="text" placeholder="Kunden suchen…" class="h-9 w-full rounded-lg bg-muted/50 pl-9 pr-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:bg-background focus:ring-2" />
  </div>
  <div class="flex items-center gap-1.5">
    <button class="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Filter class="size-3.5" />
      Filter
    </button>
    <button class="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
      <Plus class="size-3.5" />
      Neuer Kunde
    </button>
  </div>
</div>

<!-- Customer cards -->
<div class="mt-6 grid gap-4">
  {#each kunden as kunde}
    <Card.Root class="transition-colors hover:bg-muted/30 cursor-pointer">
      <Card.Content class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {kunde.name.split(' ')[0].slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium">{kunde.name}</p>
                <span class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium {statusColor(kunde.status)}">{kunde.status}</span>
              </div>
              <p class="text-sm text-muted-foreground">{kunde.kontakt}</p>
            </div>
          </div>
          <div class="flex items-center gap-8 text-sm">
            <div class="flex items-center gap-1.5 text-muted-foreground">
              <Mail class="size-3.5" />
              <span>{kunde.email}</span>
            </div>
            <div class="flex items-center gap-1.5 text-muted-foreground">
              <Phone class="size-3.5" />
              <span>{kunde.telefon}</span>
            </div>
            <div class="flex items-center gap-1.5 text-muted-foreground">
              <MapPin class="size-3.5" />
              <span>{kunde.ort}</span>
            </div>
            <div class="text-right">
              <p class="font-medium">{formatEUR(kunde.umsatz)}</p>
              <p class="text-xs text-muted-foreground">{kunde.bestellungen} Bestellungen</p>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  {/each}
</div>

<div class="mt-6 text-center text-xs text-muted-foreground">
  Zeige 1–10 von 3.429 Kunden
</div>
