<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

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
    class: className = 'bg-background',
  }: Props = $props();

  const isValid = $derived(/^\d{2}:\d{2}$/.test(value));

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

<InputLabel {label} {required} valid={isValid} for={id}>
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
</InputLabel>
