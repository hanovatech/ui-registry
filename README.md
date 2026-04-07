# HanovaTech UI Registry

A custom [shadcn-svelte](https://next.shadcn-svelte.com) component registry for SvelteKit. Install any component directly into your project with the CLI.

## Installation

```sh
npx shadcn-svelte@latest add https://hanovatech.github.io/ui-registry/r/<component-name>.json
```

## i18n

Components with internal labels (e.g., "Previous", "Save", month names) use a shared `t` store from `$lib/stores/i18nStore`. The `i18n` registry item provides a minimal store setup. If your project already has its own i18n implementation at the same paths, skip overwriting those files when prompted — the components are compatible with any implementation that exports a `t` store with the same shape.

Consumer projects should call `setTranslations()` to provide their own translations.

## Development

```sh
npm install
npm run dev
```

### Building the registry

After adding or changing components, rebuild the registry JSON output:

```sh
npm run registry:build
```

### Tech stack

- SvelteKit with Svelte 5 (runes mode)
- Tailwind CSS v4
- shadcn-svelte (nova style, neutral base color)
- TypeScript
- Deployed as a static site to GitHub Pages

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
