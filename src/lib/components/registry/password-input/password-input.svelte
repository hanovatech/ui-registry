<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import LockIcon from '@lucide/svelte/icons/lock';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import { t } from '$lib/stores/i18n';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

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

<InputLabel {label} required={required && !hideRequiredIcon} valid={!!value} for={id}>
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
        aria-label={visible ? $t.common.hidePassword : $t.common.showPassword}
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
</InputLabel>
