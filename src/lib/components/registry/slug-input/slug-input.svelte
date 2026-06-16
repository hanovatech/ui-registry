<script lang="ts">
  import { untrack } from 'svelte';
  import Input from '$lib/components/ui/input/input.svelte';

  interface Props {
    /** Bound value as a URL slug string. */
    value?: string;
    /**
     * Optional source string (e.g. a title field). When provided the slug is
     * auto-derived from `source` until the user manually edits the field.
     */
    source?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    source,
    placeholder = 'my-url-slug',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  let manuallyEdited = $state(false);

  function toSlug(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }

  // Auto-derive from source when it changes (unless user has manually edited)
  $effect(() => {
    const s = source;
    untrack(() => {
      if (s !== undefined && !manuallyEdited) value = toSlug(s);
    });
  });

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const raw = e.currentTarget.value;
    // Allow typing freely; normalise on blur
    value = raw;
    manuallyEdited = true;
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const slug = toSlug(e.currentTarget.value);
    value = slug;
    e.currentTarget.value = slug;
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="text-xs font-medium text-muted-foreground leading-none">
      {label}{#if required}<span class="text-destructive ml-0.5">*</span>{/if}
    </label>
    {@render field()}
  </div>
{:else}
  {@render field()}
{/if}

{#snippet field()}
  <Input
    {id}
    type="text"
    {value}
    {placeholder}
    {disabled}
    {required}
    class="font-mono {className}"
    oninput={handleInput}
    onblur={handleBlur}
  />
{/snippet}
