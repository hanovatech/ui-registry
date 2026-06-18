<script lang="ts">
  import type { Snippet } from 'svelte';
  import CircleDashed from '@lucide/svelte/icons/circle-dashed';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import { t } from '$lib/stores/i18n';

  interface Props {
    for?: string;
    label?: string;
    required?: boolean;
    /** `null` = not yet validated (shows neutral `*`), `true` = valid, `false` = invalid */
    valid?: boolean | null;
    hint?: string;
    class?: string;
    labelClass?: string;
    /** Optional snippet rendered to the right of the label row (e.g. a character counter). */
    labelSuffix?: Snippet;
    children?: Snippet;
  }

  let {
    for: inputFor = undefined,
    label = '',
    required = false,
    valid = null,
    hint = '',
    class: className = '',
    labelClass = '',
    labelSuffix,
    children,
  }: Props = $props();
</script>

<div class={`flex flex-col gap-1.5 ${className}`.trim()}>
  {#if label}
    <div class="flex flex-col gap-1">
      <div class={`flex items-center text-xs font-medium text-foreground/75 leading-none ${labelSuffix ? 'justify-between' : 'gap-1'}`.trim()}>
        <div class="flex items-center gap-1">
          <label for={inputFor} class={`text-inherit ${labelClass}`.trim()}>{label}</label>
          {#if required}
            {#if valid === null}
              <span class="text-muted-foreground" aria-label={$t.common.required}>*</span>
            {:else if valid}
              <CircleCheck class="size-3 text-green-500" aria-hidden="true" />
            {:else}
              <CircleDashed class="size-3 text-destructive" aria-hidden="true" />
            {/if}
          {/if}
        </div>
        {#if labelSuffix}
          {@render labelSuffix()}
        {/if}
      </div>
    </div>
  {/if}

  {@render children?.()}

  {#if hint}
    <p class="text-xs text-muted-foreground leading-snug">{hint}</p>
  {/if}
</div>
