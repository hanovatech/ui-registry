# Project Guidelines

## Overview

This is a **shadcn-svelte custom component registry** built with SvelteKit. It serves reusable UI components as JSON files that can be installed into other SvelteKit projects via the shadcn-svelte CLI.

## Tech Stack

- SvelteKit with Svelte 5 (runes mode)
- Tailwind CSS v4
- shadcn-svelte (nova style, neutral base color)
- TypeScript
- Deployed as a static site to GitHub Pages

## Project Structure

- `src/lib/components/registry/` — Registry component source files (organized by component name)
- `src/lib/components/registry/lib/` — Shared registry utilities (e.g., `navigation.ts`)
- `src/lib/components/ui/` — shadcn-svelte base UI components
- `src/lib/i18n/` — i18n setup: `en.json` (English translations, local dev only — not shipped to consumers), `index.ts` (translation loader)
- `src/lib/types/i18n.ts` — `Translations` type inferred from `en.json`
- `src/lib/stores/i18nStore.ts` — Writable `translations` store, `setTranslations()`, and derived `t` store
- `src/lib/utils/` — Shared utilities (`cn` helper, etc.)
- `src/registry.json` — Registry manifest defining all items (build-time only, not served)
- `static/r/` — Built registry JSON output (generated, do not edit manually)

## Key Commands

- `npm run dev` — Start dev server
- `npm run registry:build` — Build registry JSON files to `static/r/`
- `npm run build` — Build static site to `build/`
- `npm run check` — Type-check the project

## Registry Conventions

- Each registry component lives in `src/lib/components/registry/<name>/`
- Components must use `$lib/` imports so they resolve in both the registry project and consumer projects
- The `src/registry.json` manifest must list every component with `registryDependencies` (even if empty `[]`)
- After adding or changing registry components, run `npm run registry:build` to regenerate `static/r/`
- When adding, updating, or removing registry items (blocks, libraries, etc.), update `README.md` to keep the component table in sync
- Components that need shadcn-svelte primitives should list them in `registryDependencies` (e.g., `"button"`, `"sheet"`)
- Use `local:<name>` in `registryDependencies` to reference other items in this registry (e.g., `"local:navigation"`, `"local:i18n"`)

## i18n Conventions

- Components with internal labels (e.g., "Previous", "Save", month names) must use the `t` store from `$lib/stores/i18nStore`
- Import as: `import { t } from '$lib/stores/i18nStore';` — use `$t.common.<key>` in templates
- Label props should default to `$t.common.<key>` (e.g., `previousLabel = $t.common.previous`) so they are translatable yet overridable
- The `en.json` file in this project exists only for local development — it is **not** included in the `i18n` registry item
- The `i18n` registry item ships: `stores/i18nStore.ts`, `i18n/index.ts`, `types/i18n.ts`
- Consumer projects are expected to have their own translation JSON files and call `setTranslations()` to provide them
- When adding a new label to a component, add the English default to `src/lib/i18n/en.json` under `common`

## Code Style

- Svelte 5 runes (`$props()`, `$derived`, `$state`, `$effect`)
- Use `$lib/utils/shadcn.js` for `cn()` and type helpers
- Prefer `index.ts` barrel exports for multi-file components
- Import UI components with explicit `/index.js` suffix (e.g., `$lib/components/ui/button/index.js`)
- Use `resolve()` from `$app/paths` instead of the deprecated `base` export

## Component Previews

- The homepage (`src/routes/+page.svelte`) shows a live preview for each registry component
- When adding a new component, add a preview entry in `+page.svelte`: import the component, add it to `previewComponents`, and add a preview block with sample data
- Previews are wrapped in `{#if browser}` because the site is prerendered and components that access `page.url.searchParams` cannot run during SSR
