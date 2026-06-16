<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';

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
    placeholder = '••••••••',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  let visible = $state(false);
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
    <Input
      {id}
      type={visible ? 'text' : 'password'}
      bind:value
      {placeholder}
      {disabled}
      {required}
      class="pr-9 {className}"
    />
    <button
      type="button"
      {disabled}
      tabindex="-1"
      aria-label={visible ? 'Hide password' : 'Show password'}
      onclick={() => (visible = !visible)}
      class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
    >
      {#if visible}
        <EyeOffIcon class="size-4" />
      {:else}
        <EyeIcon class="size-4" />
      {/if}
    </button>
  </div>
{/snippet}
