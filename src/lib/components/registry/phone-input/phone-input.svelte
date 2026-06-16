<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import PhoneIcon from '@lucide/svelte/icons/phone';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';

  interface Props {
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
    placeholder = '+49 123 456789',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  // Valid when at least 6 digits are present
  const isValid = $derived((value.match(/\d/g) ?? []).length >= 6);

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    // Allow only: digits, spaces, +, -, (, ), /
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9\s+\-()\/]/g, '');
    value = e.currentTarget.value;
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="flex items-center gap-1 text-xs font-medium text-foreground/75 leading-none">
      {label}
      {#if required}
        {#if isValid}
          <CircleCheck class="size-3 text-green-500" />
        {:else}
          <CircleDashed class="size-3 text-destructive" />
        {/if}
      {/if}
    </label>
    {@render field()}
  </div>
{:else}
  {@render field()}
{/if}

{#snippet field()}
  <div class="relative">
    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground">
      <PhoneIcon class="size-4" />
    </span>
    <Input
      {id}
      type="tel"
      inputmode="tel"
      {placeholder}
      {value}
      {disabled}
      {required}
      class="pl-9 {className}"
      oninput={handleInput}
    />
  </div>
{/snippet}
