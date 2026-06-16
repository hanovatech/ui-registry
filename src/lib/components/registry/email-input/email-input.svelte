<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import MailIcon from '@lucide/svelte/icons/mail';
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
    placeholder = 'name@beispiel.de',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  const isValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value));
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
      <MailIcon class="size-4" />
    </span>
    <Input
      {id}
      type="email"
      inputmode="email"
      {placeholder}
      bind:value
      {disabled}
      {required}
      class="pl-9 {className}"
    />
  </div>
{/snippet}
