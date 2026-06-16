<script lang="ts">
  import CardRoot from '$lib/components/ui/card/card.svelte';
  import type { ComponentProps } from 'svelte';

  let { class: className, ...restProps }: ComponentProps<typeof CardRoot> = $props();
</script>

<CardRoot class="shadow-md {className ?? ''}" {...restProps} />
