<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import XIcon from '@lucide/svelte/icons/x';
  import { cn } from '$lib/utils/registry/cn.js';

  interface Props {
    /** Bound value as a hex color string (`#rrggbb`), or `''` for empty. */
    value?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  let nativeEl: HTMLInputElement | undefined = $state();

  /** Normalise a user-typed string to `#rrggbb` or return null if invalid. */
  function normalise(raw: string): string | null {
    const s = raw.trim().replace(/^#+/, '');
    if (/^[0-9a-fA-F]{6}$/.test(s)) return '#' + s.toLowerCase();
    if (/^[0-9a-fA-F]{3}$/.test(s)) {
      const [r, g, b] = s;
      return '#' + r + r + g + g + b + b;
    }
    return null;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const raw = e.currentTarget.value;
    if (raw === '') { value = ''; return; }
    const hex = normalise(raw);
    if (hex) value = hex;
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const raw = e.currentTarget.value;
    if (raw === '') { value = ''; return; }
    const hex = normalise(raw);
    if (hex) {
      value = hex;
      e.currentTarget.value = hex;
    } else {
      e.currentTarget.value = value;
    }
  }

  function handleNative(e: Event & { currentTarget: HTMLInputElement }) {
    value = e.currentTarget.value;
  }

  function openPicker() {
    if (disabled || !nativeEl) return;
    nativeEl.click();
  }

  function clear() {
    value = '';
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
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
    {@render field()}
  </div>
{:else}
  {@render field()}
{/if}

{#snippet field()}
  <div class="relative">
    <!-- Hidden native color picker -->
    <input
      bind:this={nativeEl}
      type="color"
      value={value || '#000000'}
      {disabled}
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 left-2 size-0 opacity-0"
      onchange={handleNative}
      oninput={handleNative}
    />

    <!-- Color swatch button -->
    <button
      type="button"
      {disabled}
      tabindex="-1"
      aria-label="Open color picker"
      onclick={openPicker}
      class="absolute inset-y-0 left-0 flex items-center pl-2.5 disabled:pointer-events-none disabled:opacity-50"
    >
      {#if value}
        <span
          class="size-5 rounded-sm border border-input shadow-sm"
          style="background-color: {value}"
        ></span>
      {:else}
        <span class="size-5 rounded-sm border border-input bg-muted shadow-sm"></span>
      {/if}
    </button>

    <Input
      {id}
      type="text"
      {value}
      placeholder="#000000"
      {disabled}
      {required}
      class={cn('pl-9 pr-9 font-mono', className)}
      oninput={handleInput}
      onblur={handleBlur}
    />

    <!-- Clear button -->
    <button
      type="button"
      {disabled}
      tabindex="-1"
      aria-label="Clear color"
      onclick={clear}
      class={cn(
        'absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground transition-opacity hover:text-foreground disabled:pointer-events-none',
        value ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <XIcon class="size-4" />
    </button>
  </div>
{/snippet}
