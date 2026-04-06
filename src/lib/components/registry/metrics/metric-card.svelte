<script lang="ts">
  interface Props {
    title: string;
    value: string;
    icon?: string;
    description?: string;
  }
  let { title, value, icon, description }: Props = $props();
</script>

<div class="rounded-lg border bg-card p-6">
  <div class="flex items-start justify-between">
    <div class="space-y-2">
      <p class="text-sm font-medium text-muted-foreground">{title}</p>
      <p class="text-3xl font-bold tracking-tight">{value}</p>
      {#if description}
        <p class="text-xs text-muted-foreground">{description}</p>
      {/if}
    </div>
    {#if icon}
      <div class="text-4xl">{icon}</div>
    {/if}
  </div>
</div>
