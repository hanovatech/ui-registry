<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import LinkIcon from '@lucide/svelte/icons/link';

  interface Props {
    /** Bound value as a URL string. */
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = 'https://example.com',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  let invalid = $state(false);

  function isValidUrl(s: string): boolean {
    if (!s) return true;
    try { new URL(s); return true; } catch { return false; }
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    value = e.currentTarget.value;
    invalid = false;
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const raw = e.currentTarget.value.trim();
    if (!raw) { value = ''; invalid = false; return; }
    // Auto-prepend https:// if no protocol present
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
    if (isValidUrl(withProtocol)) {
      value = withProtocol;
      e.currentTarget.value = withProtocol;
      invalid = false;
    } else {
      invalid = true;
    }
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
  <div class="relative">
    <LinkIcon class="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 size-4 {invalid ? 'text-destructive' : 'text-muted-foreground'}" />
    <Input
      {id}
      type="url"
      {value}
      {placeholder}
      {disabled}
      {required}
      class="pl-9 {invalid ? 'border-destructive focus-visible:ring-destructive/20' : ''} {className}"
      oninput={handleInput}
      onblur={handleBlur}
    />
  </div>
{/snippet}
