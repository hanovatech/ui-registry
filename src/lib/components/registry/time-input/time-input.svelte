<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';

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
    placeholder = 'HH:MM',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = "bg-background",
  }: Props = $props();

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const el = e.currentTarget;
    const pos = el.selectionStart ?? 0;
    const raw = el.value;
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 4);
    let v = digits;
    if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2);
    el.value = v;
    const newPos =
      !raw.includes(':') && v.includes(':') && pos > 2
        ? pos + 1
        : Math.min(pos, v.length);
    el.setSelectionRange(newPos, newPos);
    value = v;
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const m = e.currentTarget.value.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
      const h = Math.min(parseInt(m[1]), 23);
      const min = Math.min(parseInt(m[2]), 59);
      value = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="flex items-center gap-1 text-xs font-medium text-foreground/75 leading-none">
      {label}
      {#if required}
        {#if /^\d{2}:\d{2}$/.test(value)}
          <CircleCheck class="size-3 text-green-500" />
        {:else}
          <CircleDashed class="size-3 text-destructive" />
        {/if}
      {/if}
    </label>
    {@render input()}
  </div>
{:else}
  {@render input()}
{/if}

{#snippet input()}
  <Input
    {id}
    type="text"
    inputmode="numeric"
    {placeholder}
    {value}
    {disabled}
    {required}
    class={className}
    oninput={handleInput}
    onblur={handleBlur}
  />
{/snippet}
