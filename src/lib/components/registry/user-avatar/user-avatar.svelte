<script lang="ts">
  import type { Snippet } from 'svelte';
  import * as Avatar from '$lib/components/ui/avatar/index.js';
  import { avatarColor, avatarInitials } from './avatar.js';

  // Avatar for a person: shows `src` when given and loadable, otherwise a
  // letter avatar whose background colour is derived from `seed` — so people
  // are easy to tell apart and keep their colour across pages and renames.
  interface Props {
    name?: string | null;
    email?: string | null;
    /** Profile picture URL. The initials stay as fallback while it loads or
     *  if it fails. */
    src?: string | null;
    /** Stable identity for the colour (e.g. user id); defaults to email, then name. */
    seed?: string | null;
    size?: 'sm' | 'default' | 'lg';
    class?: string;
    /** Extra classes for the fallback — a `bg-*` here overrides the generated
     *  colour, a `text-*` the initials' size (needed when `class` enlarges the
     *  circle beyond the `lg` size). */
    fallbackClass?: string;
    /** Replaces the initials, e.g. an icon for non-human authors. */
    children?: Snippet;
  }

  let {
    name,
    email,
    src,
    seed,
    size = 'default',
    class: className,
    fallbackClass,
    children
  }: Props = $props();

  const initials = $derived(avatarInitials(name, email));
  const color = $derived(avatarColor(seed ?? email ?? name ?? ''));
  const label = $derived(name || email || undefined);
</script>

<!-- Keyed on src: bits-ui keeps its loading status across prop changes, so
     removing a loaded picture would otherwise hide the fallback too and leave
     an empty circle until the next remount. -->
{#key src}
  <Avatar.Root {size} class={className} title={label}>
    {#if src}
      <Avatar.Image {src} alt={label ?? ''} class="object-cover" />
    {/if}
    <!-- The fallback's own cn() runs tailwind-merge, so a bg-* or text-* in
         fallbackClass wins over the generated colour and the default size. -->
    <Avatar.Fallback
      class={['font-medium text-white', color, fallbackClass].filter(Boolean).join(' ')}
    >
      {#if children}
        {@render children()}
      {:else}
        {initials}
      {/if}
    </Avatar.Fallback>
  </Avatar.Root>
{/key}
