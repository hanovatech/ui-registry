<script lang="ts">
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    hint?: string;
    id?: string;
    /** Visible height in text rows. Adjust this instead of a height class. */
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
    hint = '',
    id = crypto.randomUUID(),
    rows = 3,
    maxlength,
    class: className = 'bg-background',
  }: Props = $props();
</script>

<InputLabel {label} {required} valid={!!value} for={id} {hint}>
  {#snippet labelSuffix()}
    {#if maxlength}
      <span class="text-xs leading-none text-muted-foreground">{value.length}/{maxlength}</span>
    {/if}
  {/snippet}

  <!-- Override the base min-height + content-based sizing so `rows` governs height. -->
  <Textarea
    {id}
    {placeholder}
    bind:value
    {disabled}
    {required}
    {rows}
    {maxlength}
    class={`min-h-0 field-sizing-fixed ${className}`}
  />
</InputLabel>
