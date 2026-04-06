import registry from '../../registry.json';
import type { RequestHandler } from './$types';

export const prerender = true;

const typeLabels: Record<string, string> = {
  'registry:ui': 'UI Components',
  'registry:component': 'Components',
  'registry:block': 'Blocks',
  'registry:lib': 'Libraries',
  'registry:hook': 'Hooks',
  'registry:page': 'Pages',
  'registry:file': 'Files',
  'registry:style': 'Styles',
  'registry:theme': 'Themes',
};

const typeOrder = Object.keys(typeLabels);

export const GET: RequestHandler = () => {
  const baseUrl = 'https://hanovatech.github.io/ui-registry';

  const sections = typeOrder
    .map(type => ({
      label: typeLabels[type],
      items: registry.items.filter(i => i.type === type),
    }))
    .filter(s => s.items.length > 0);

  const lines: string[] = [
    '# HanovaTech UI Registry',
    '',
    '> Custom shadcn-svelte components for SvelteKit.',
    '',
    '## Installation',
    '',
    'Install any component with the shadcn-svelte CLI:',
    '',
    '```',
    `npx shadcn-svelte@latest add ${baseUrl}/r/<component-name>.json`,
    '```',
    '',
    '## Requirements',
    '',
    '- SvelteKit with Svelte 5',
    '- Tailwind CSS v4',
    '- shadcn-svelte',
    '',
    'Components that use labels (pagination, search, date pickers, etc.) depend on an i18n store at `$lib/stores/i18nStore`. Install the `i18n` library first or provide your own compatible implementation.',
    '',
  ];

  for (const section of sections) {
    lines.push(`## ${section.label}`, '');
    for (const item of section.items) {
      lines.push(`### ${item.title}`, '');
      lines.push(item.description, '');
      lines.push('```');
      lines.push(`npx shadcn-svelte@latest add ${baseUrl}/r/${item.name}.json`);
      lines.push('```');
      if (item.registryDependencies.length > 0) {
        lines.push('');
        lines.push(`Dependencies: ${item.registryDependencies.join(', ')}`);
      }
      lines.push('');
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
