<script lang="ts">
  import { Textarea } from '$lib/components/ui/textarea/index.js';

  interface Props {
    value?: string;
    placeholder?: string;
    rows?: number;
    /** Auto-grow to fit content instead of scrolling. */
    autoresize?: boolean;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    rows = 3,
    autoresize = false,
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  let el: HTMLTextAreaElement | undefined = $state();

  function resize() {
    if (!autoresize || !el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  $effect(() => {
    // Resize on initial render when autoresize is enabled
    if (autoresize) resize();
  });
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
  <Textarea
    bind:ref={el}
    {id}
    bind:value
    {placeholder}
    {rows}
    {disabled}
    {required}
    class="{autoresize ? 'resize-none overflow-hidden' : ''} {className}"
    oninput={resize}
  />
{/snippet}
