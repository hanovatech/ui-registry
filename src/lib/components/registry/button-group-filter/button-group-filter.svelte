<script lang="ts">
  import { page } from '$app/state';
  import { gotoParams } from '$lib/utils/navigation.js';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import { Button } from "$lib/components/ui/button/index.js";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";

  interface Props {
    key: string;
    defaultValue?: string;
    options: Array<{ value: string; label: string; }>;
  }

  let { key, options, defaultValue = '' }: Props = $props();

  const currentValue = $derived(page.url.searchParams.get(key) || defaultValue);

  function handleFilterChange(value: string) {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.delete('page');
    if (value) { params.set(key, value); } else { params.delete(key); }
    gotoParams(params);
  }
</script>

<ButtonGroup.Root>
  {#each options as option (option.value)}
    <Button variant={currentValue === option.value ? "default" : "outline"} onclick={() => handleFilterChange(option.value)}>
      {option.label}
    </Button>
  {/each}
</ButtonGroup.Root>
