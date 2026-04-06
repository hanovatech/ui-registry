<script lang="ts">
	import Self from './json-tree.svelte';

	type Props = {
		data: unknown;
		key?: string;
		expanded?: boolean;
		depth?: number;
	};

	let { data, key, expanded = true, depth = 0 }: Props = $props();

	let isOpen = $state<boolean | null>(null);
	const effectiveOpen = $derived(isOpen ?? expanded);

	const isObject = $derived(data !== null && typeof data === 'object');
	const isArray = $derived(Array.isArray(data));
	const entries = $derived(isObject ? Object.entries(data as Record<string, unknown>) : []);
	const isEmpty = $derived(entries.length === 0);
	const preview = $derived(
		isArray
			? `[${isEmpty ? '' : `${entries.length}`}]`
			: `{${isEmpty ? '' : `${entries.length}`}}`
	);

	function toggle() {
		if (isObject && !isEmpty) isOpen = !effectiveOpen;
	}

	function formatValue(val: unknown): string {
		if (val === null) return 'null';
		if (val === undefined) return 'undefined';
		if (typeof val === 'string') return `"${val}"`;
		return String(val);
	}

	function valueClass(val: unknown): string {
		if (val === null || val === undefined) return 'text-muted-foreground/60';
		if (typeof val === 'string') return 'text-green-600 dark:text-green-400';
		if (typeof val === 'number') return 'text-blue-600 dark:text-blue-400';
		if (typeof val === 'boolean') return 'text-amber-600 dark:text-amber-400';
		return '';
	}
</script>

<div class="font-mono text-xs leading-5" style:padding-left="{depth > 0 ? 16 : 0}px">
	{#if isObject}
		<button
			type="button"
			class="inline-flex items-baseline gap-1 hover:bg-muted/50 rounded px-0.5 -ml-0.5 cursor-pointer"
			class:cursor-default={isEmpty}
			onclick={toggle}
		>
			{#if !isEmpty}
				<span class="text-muted-foreground text-[10px] w-3 inline-block select-none">
					{isOpen ? '▼' : '▶'}
				</span>
			{:else}
				<span class="w-3 inline-block"></span>
			{/if}
			{#if key !== undefined}
				<span class="text-foreground/80">{key}:</span>
			{/if}
			{#if !effectiveOpen || isEmpty}
				<span class="text-muted-foreground">{preview}</span>
			{:else}
				<span class="text-muted-foreground">{isArray ? '[' : '{'}</span>
			{/if}
		</button>
		{#if effectiveOpen && !isEmpty}
			{#each entries as [k, v] (k)}
				<Self data={v} key={k} expanded={depth < 1} depth={depth + 1} />
			{/each}
			<div style:padding-left="16px">
				<span class="text-muted-foreground">{isArray ? ']' : '}'}</span>
			</div>
		{/if}
	{:else}
		<div class="inline-flex items-baseline gap-1 px-0.5 -ml-0.5">
			<span class="w-3 inline-block"></span>
			{#if key !== undefined}
				<span class="text-foreground/80">{key}:</span>
			{/if}
			<span class={valueClass(data)}>{formatValue(data)}</span>
		</div>
	{/if}
</div>
