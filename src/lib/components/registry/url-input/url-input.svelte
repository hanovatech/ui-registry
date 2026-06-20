<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import GlobeIcon from '@lucide/svelte/icons/globe';
  import { InputLabel } from '$lib/components/registry/input-label/index.js';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /**
     * `true` (default): expects a full URL with `http(s)://` schema.
     * `false`: expects a bare domain (e.g. `hanovatech.de`); schema and
     * path/query/hash are stripped automatically on blur and paste.
     */
    requireProtocol?: boolean;
    /**
     * How trailing slashes are handled on normalisation (blur / paste) and validation.
     * - `'forbid'` (default): trailing `/` is removed; URLs ending with `/` are invalid.
     * - `'require'`: trailing `/` is appended if missing; URLs without `/` are invalid.
     * - `'preserve'`: slash is untouched; both forms are valid.
     */
    trailingSlash?: 'forbid' | 'require' | 'preserve';
    label?: string;
    hint?: string;
    id?: string;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = undefined,
    disabled = false,
    required = false,
    requireProtocol = true,
    trailingSlash = 'forbid',
    label = '',
    hint = '',
    id = crypto.randomUUID(),
    class: className = 'bg-background',
  }: Props = $props();

  const effectivePlaceholder = $derived(
    placeholder ?? (requireProtocol ? 'https://example.com' : 'www.example.com')
  );

  const isValid = $derived.by((): boolean | null => {
    if (!value) return null;

    if (requireProtocol) {
      if (!/^https?:\/\/.+\..+/.test(value)) return false;
    } else {
      // Validate domain part without any trailing slash
      const domain = value.endsWith('/') ? value.slice(0, -1) : value;
      if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain)) return false;
    }

    if (trailingSlash === 'forbid') return !value.endsWith('/');
    if (trailingSlash === 'require') return value.endsWith('/');
    return true;
  });

  function applySlash(v: string): string {
    if (!v) return v;
    if (trailingSlash === 'forbid') return v.replace(/\/+$/, '');
    if (trailingSlash === 'require') return v.endsWith('/') ? v : v + '/';
    return v;
  }

  function toDomain(raw: string): string {
    return raw.trim()
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0];
  }

  function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
    const raw = e.currentTarget.value;
    if (!raw) return;
    const v = applySlash(requireProtocol ? raw.trim() : toDomain(raw));
    if (v !== raw) {
      e.currentTarget.value = v;
      value = v;
    }
  }

  // Only intercept paste in lenient mode to strip schema + path immediately.
  function handlePaste(e: ClipboardEvent & { currentTarget: HTMLInputElement }) {
    if (requireProtocol) return;
    e.preventDefault();
    const v = applySlash(toDomain(e.clipboardData?.getData('text') ?? ''));
    e.currentTarget.value = v;
    value = v;
  }
</script>

<InputLabel {label} {required} valid={isValid} for={id} {hint}>
  <div class="relative">
    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground">
      <GlobeIcon class="size-4" />
    </span>
    <Input
      {id}
      type="text"
      inputmode="url"
      placeholder={effectivePlaceholder}
      bind:value
      {disabled}
      {required}
      class="pl-9 {className}"
      onblur={handleBlur}
      onpaste={handlePaste}
    />
  </div>
</InputLabel>
