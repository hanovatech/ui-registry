<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setTranslations } from '$lib/stores/i18nStore';
	import en from '$lib/i18n/en.json';

	setTranslations(en);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>HanovaTech UI Registry</title>
</svelte:head>

{@render children()}
