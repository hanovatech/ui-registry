<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import * as Select from '$lib/components/ui/select/index.js';

  interface Props {
    key: string;
    defaultValue?: string;
    placeholder?: string;
    label?: string;
    options: Array<{ value: string; label: string; }>;
    class?: string;
  }

  let { key, options, defaultValue = '', placeholder = '', label = '', class: className = 'w-[220px] bg-background' }: Props = $props();

  const currentValue = $derived(page.url.searchParams.get(key) || defaultValue);
  const currentLabel = $derived(() => {
    const option = options.find(o => o.value === currentValue);
    return option?.label || placeholder;
  });

  function handleValueChange(value: string) {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.delete('page');
    if (value) { params.set(key, value); } else { params.delete(key); }
    gotoParams(params);
  }

  function gotoParams(params: URLSearchParams) {
    goto(`${page.url.pathname}?${params.toString()}`);
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <span class="text-xs font-medium text-muted-foreground leading-none">{label}</span>
    {@render select()}
  </div>
{:else}
  {@render select()}
{/if}

{#snippet select()}
  <Select.Root type="single" value={currentValue} onValueChange={handleValueChange}>
    <Select.Trigger class={className}>
      <span data-slot="select-value">{currentLabel()}</span>
    </Select.Trigger>
    <Select.Content>
      {#each options as option (option.value)}
        <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
{/snippet}
