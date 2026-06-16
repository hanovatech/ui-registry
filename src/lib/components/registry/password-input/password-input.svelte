<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import LockIcon from '@lucide/svelte/icons/lock';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /** Hide the required indicator entirely (e.g. for password fields). */
    hideRequiredIcon?: boolean;
    /** Hide the show/hide toggle (e.g. when the field contains dummy data). */
    hideToggle?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = '••••••••',
    disabled = false,
    required = false,
    hideRequiredIcon = false,
    hideToggle = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  let visible = $state(false);
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="flex items-center gap-1 text-xs font-medium text-foreground/75 leading-none">
      {label}
      {#if required && !hideRequiredIcon}
        {#if value}
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
      <LockIcon class="size-4" />
    </span>
    <Input
      {id}
      type={visible ? 'text' : 'password'}
      {placeholder}
      bind:value
      {disabled}
      {required}
      class="pl-9 {hideToggle ? '' : 'pr-9'} {className}"
    />
    {#if !hideToggle}
      <button
        type="button"
        tabindex="-1"
        {disabled}
        aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
        onclick={() => (visible = !visible)}
        class="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        {#if visible}
          <EyeOffIcon class="size-4" />
        {:else}
          <EyeIcon class="size-4" />
        {/if}
      </button>
    {/if}
  </div>
{/snippet}
