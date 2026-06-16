<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import PhoneIcon from '@lucide/svelte/icons/phone';

  interface Props {
    /** Bound value as a phone number string. */
    value?: string;
    /** Optional fixed country code prefix shown before the input (e.g. `'+49'`). */
    prefix?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    prefix = '',
    placeholder = '+49 123 456789',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    // Allow: +, digits, spaces, hyphens, parentheses
    const filtered = e.currentTarget.value.replace(/[^+\d\s\-().]/g, '');
    e.currentTarget.value = filtered;
    value = prefix ? prefix + ' ' + filtered : filtered;
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
    {#if prefix}
      <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
        {prefix}
      </span>
    {:else}
      <PhoneIcon class="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 size-4 text-muted-foreground" />
    {/if}
    <Input
      {id}
      type="tel"
      value={prefix ? value.replace(prefix, '').trimStart() : value}
      {placeholder}
      {disabled}
      {required}
      class="{prefix ? 'pl-10' : 'pl-9'} {className}"
      oninput={handleInput}
    />
  </div>
{/snippet}
