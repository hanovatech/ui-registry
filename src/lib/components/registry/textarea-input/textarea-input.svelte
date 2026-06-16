<script lang="ts">
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    rows?: number;
    maxlength?: number;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    rows,
    maxlength,
    class: className = 'bg-background',
  }: Props = $props();
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center justify-between">
      <label for={id} class="flex items-center gap-1 text-xs font-medium text-foreground/75 leading-none">
        {label}
        {#if required}
          {#if value}
            <CircleCheck class="size-3 text-green-500" />
          {:else}
            <CircleDashed class="size-3 text-destructive" />
          {/if}
        {/if}
      </label>
      {#if maxlength}
        <span class="text-xs leading-none text-muted-foreground">{value.length}/{maxlength}</span>
      {/if}
    </div>
    {@render field()}
  </div>
{:else}
  {@render field()}
{/if}

{#snippet field()}
  <Textarea
    {id}
    {placeholder}
    bind:value
    {disabled}
    {required}
    {rows}
    {maxlength}
    class={className}
  />
{/snippet}
