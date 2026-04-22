<script lang="ts">
  import { Search, Filter, Upload, FileText, FileSpreadsheet, Image, File, Download, MoreVertical, FolderOpen } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import Metrics from '$lib/components/registry/metrics/metrics.svelte';

  const metrics = [
    { value: 1243, format: 'number' as const, emoji: '📁', title: 'Dokumente', description: 'Gesamt gespeichert' },
    { value: 47, format: 'number' as const, emoji: '🆕', title: 'Kürzlich hochgeladen', description: 'Letzte 7 Tage' },
    { value: 2.4, format: 'number' as const, emoji: '💾', title: 'Speicherplatz (GB)', description: 'Von 10 GB belegt' },
    { value: 18, format: 'number' as const, emoji: '👥', title: 'Freigegeben', description: 'Mit dem Team geteilt' },
  ];

  function formatDatum(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatGroesse(kb: number): string {
    if (kb >= 1024) return (kb / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' MB';
    return kb.toLocaleString('de-DE') + ' KB';
  }

  type DocIcon = typeof FileText;

  function typeIcon(typ: string): { icon: DocIcon; color: string } {
    switch (typ) {
      case 'PDF': return { icon: FileText, color: 'text-red-500' };
      case 'Excel': return { icon: FileSpreadsheet, color: 'text-emerald-600' };
      case 'Bild': return { icon: Image, color: 'text-blue-500' };
      default: return { icon: File, color: 'text-muted-foreground' };
    }
  }

  const ordner = [
    { name: 'Verträge', dateien: 89, geaendert: new Date(2026, 3, 16) },
    { name: 'Rechnungen', dateien: 456, geaendert: new Date(2026, 3, 17) },
    { name: 'Produktdaten', dateien: 234, geaendert: new Date(2026, 3, 14) },
    { name: 'Marketing', dateien: 67, geaendert: new Date(2026, 3, 12) },
    { name: 'Vorlagen', dateien: 23, geaendert: new Date(2026, 3, 8) },
  ];

  const dokumente = [
    { name: 'Angebot_Hoffmann_2026-04.pdf', typ: 'PDF', groesse: 2450, hochgeladen: new Date(2026, 3, 17, 15, 30), benutzer: 'Anna Krüger', ordner: 'Verträge' },
    { name: 'Umsatzbericht_Q1_2026.xlsx', typ: 'Excel', groesse: 1820, hochgeladen: new Date(2026, 3, 17, 11, 20), benutzer: 'Max Becker', ordner: 'Rechnungen' },
    { name: 'Produktkatalog_2026.pdf', typ: 'PDF', groesse: 8900, hochgeladen: new Date(2026, 3, 16, 9, 45), benutzer: 'Anna Krüger', ordner: 'Produktdaten' },
    { name: 'Lieferschein_BES-2024-1845.pdf', typ: 'PDF', groesse: 340, hochgeladen: new Date(2026, 3, 16, 16, 50), benutzer: 'System', ordner: 'Rechnungen' },
    { name: 'Produktfoto_ISP-X1.jpg', typ: 'Bild', groesse: 4200, hochgeladen: new Date(2026, 3, 15, 14, 10), benutzer: 'Julia Meier', ordner: 'Produktdaten' },
    { name: 'AGB_HanovaTech_v3.pdf', typ: 'PDF', groesse: 890, hochgeladen: new Date(2026, 3, 14, 10, 0), benutzer: 'Anna Krüger', ordner: 'Verträge' },
    { name: 'Preisliste_April_2026.xlsx', typ: 'Excel', groesse: 560, hochgeladen: new Date(2026, 3, 13, 8, 30), benutzer: 'Max Becker', ordner: 'Produktdaten' },
    { name: 'Kundenauswertung_2026.xlsx', typ: 'Excel', groesse: 3100, hochgeladen: new Date(2026, 3, 12, 13, 15), benutzer: 'Anna Krüger', ordner: 'Marketing' },
    { name: 'Messeplanung_Hannover_2026.pdf', typ: 'PDF', groesse: 1560, hochgeladen: new Date(2026, 3, 10, 9, 0), benutzer: 'Julia Meier', ordner: 'Marketing' },
    { name: 'Briefvorlage_HanovaTech.docx', typ: 'Sonstige', groesse: 245, hochgeladen: new Date(2026, 3, 8, 11, 40), benutzer: 'Anna Krüger', ordner: 'Vorlagen' },
  ];
</script>

<svelte:head>
  <title>Dokumente — HanovaTech</title>
</svelte:head>

<Metrics {metrics} columns={4} />

<!-- Filters -->
<div class="mt-8 flex items-center gap-3 rounded-xl border bg-card p-2 shadow-sm">
  <div class="relative flex-1">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <input type="text" placeholder="Dokument suchen…" class="h-9 w-full rounded-lg bg-muted/50 pl-9 pr-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:bg-background focus:ring-2" />
  </div>
  <div class="flex items-center gap-1.5">
    <button class="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Filter class="size-3.5" />
      Typ
    </button>
    <button class="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
      <Upload class="size-3.5" />
      Hochladen
    </button>
  </div>
</div>

<!-- Folders -->
<div class="mt-6 grid grid-cols-5 gap-4">
  {#each ordner as o}
    <Card.Root class="cursor-pointer transition-colors hover:bg-muted/30">
      <Card.Content class="p-4">
        <div class="flex items-center gap-3">
          <FolderOpen class="size-5 text-amber-500" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{o.name}</p>
            <p class="text-xs text-muted-foreground">{o.dateien} Dateien</p>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  {/each}
</div>

<!-- Files table -->
<Card.Root class="mt-6">
  <Card.Header>
    <Card.Title>Kürzlich bearbeitet</Card.Title>
    <Card.Description>Zuletzt geänderte Dokumente</Card.Description>
  </Card.Header>
  <Card.Content class="p-0">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Ordner</th>
            <th class="px-6 py-3 text-right font-medium text-muted-foreground">Größe</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Hochgeladen</th>
            <th class="px-6 py-3 text-left font-medium text-muted-foreground">Benutzer</th>
            <th class="px-6 py-3 text-center font-medium text-muted-foreground">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {#each dokumente as doc}
            {@const icon = typeIcon(doc.typ)}
            <tr class="border-b transition-colors hover:bg-muted/30 cursor-pointer">
              <td class="px-6 py-3">
                <div class="flex items-center gap-2">
                  <icon.icon class="size-4 {icon.color}" />
                  <span class="font-medium">{doc.name}</span>
                </div>
              </td>
              <td class="px-6 py-3 text-muted-foreground">{doc.ordner}</td>
              <td class="px-6 py-3 text-right text-muted-foreground">{formatGroesse(doc.groesse)}</td>
              <td class="px-6 py-3 text-muted-foreground">{formatDatum(doc.hochgeladen)}</td>
              <td class="px-6 py-3 text-muted-foreground">{doc.benutzer}</td>
              <td class="px-6 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button class="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <Download class="size-4" />
                  </button>
                  <button class="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <MoreVertical class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card.Content>
  <Card.Footer class="justify-between text-xs text-muted-foreground">
    <span>Zeige 1–10 von 1.243 Dokumenten</span>
    <span>2,4 GB von 10 GB belegt</span>
  </Card.Footer>
</Card.Root>
