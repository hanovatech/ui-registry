<script lang="ts">
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

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

<InputLabel {label} {required} valid={!!value} for={id}>
  {#snippet labelSuffix()}
    {#if maxlength}
      <span class="text-xs leading-none text-muted-foreground">{value.length}/{maxlength}</span>
    {/if}
  {/snippet}

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
</InputLabel>
