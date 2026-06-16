<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';

  interface Props {
    /** Bound value in `HH:MM:SS` format, or `''` for empty. */
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
    placeholder = 'HH:MM:SS',
    disabled = false,
    required = false,
    label = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  function pad(n: number | string): string {
    return String(n).padStart(2, '0');
  }

  function format(digits: string): string {
    const d = digits.slice(0, 6);
    if (d.length >= 5) return d.slice(0, 2) + ':' + d.slice(2, 4) + ':' + d.slice(4);
    if (d.length >= 3) return d.slice(0, 2) + ':' + d.slice(2);
    return d;
  }

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    const el = e.currentTarget;
    const pos = el.selectionStart ?? 0;
    const raw = el.value;
    const digits = raw.replace(/[^0-9]/g, '');
    const digitsBeforeCursor = raw.slice(0, pos).replace(/[^0-9]/g, '').length;

    const v = format(digits);
    el.value = v;

    // Restore cursor past auto-inserted colons
    let seen = 0;
    let newPos = v.length;
    for (let i = 0; i < v.length; i++) {
      if (seen >= digitsBeforeCursor) { newPos = i; break; }
      if (/\d/.test(v[i])) seen++;
    }
    el.setSelectionRange(newPos, newPos);

    value = v;
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const m = e.currentTarget.value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) { value = ''; e.currentTarget.value = ''; return; }
    const h = Math.min(parseInt(m[1]), 99);
    const min = Math.min(parseInt(m[2]), 59);
    const sec = m[3] !== undefined ? Math.min(parseInt(m[3]), 59) : 0;
    value = `${pad(h)}:${pad(min)}:${pad(sec)}`;
    e.currentTarget.value = value;
  }
</script>

{#if label}
  <div class="flex flex-col gap-1.5">
    <label for={id} class="text-xs font-medium text-muted-foreground leading-none">
      {label}{#if required}<span class="text-destructive ml-0.5">*</span>{/if}
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
