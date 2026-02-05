<script context="module">
	import { fallbackAllData as fallbackAllDataModule } from '$lib/cms/fallback';
	export async function load({ fetch }) {
		let allData = fallbackAllDataModule;
		try {
			const res = await fetch('/data/getAllContentful.json');
			const contentType = res.headers.get('content-type') ?? '';
			if (res.ok && contentType.includes('application/json')) {
				const parsed = await res.json();
				if (parsed?.allData) allData = parsed.allData;
			}
		} catch {
			// keep fallback
		}

		const { things } = await fetch('../data/getAllProducts.json').then((results) => {
			return results.json();
		});

		return {
			props: {
				allData,
				things
			}
		};
	}
</script>

<script>
	import HomeNews from '$lib/components/HomeNews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import Featured from '$lib/components/Featured.svelte';
	import BreakRange from '$lib/components/BreakRange.svelte';
	import { onMount } from 'svelte';
	export let allData;
	export let things;

	onMount(() => {
		// If Netlify Identity invite/recovery lands on "/", forward to /admin
		// while preserving the hash token.
		if (typeof window === 'undefined') return;
		const hash = window.location.hash || '';
		if (hash.includes('invite_token=') || hash.includes('recovery_token=')) {
			window.location.replace(`/admin/${hash}`);
		}
	});
</script>

<svelte:head>
	<title>North of the Border Fireworks</title>
	<meta
		name="description"
		content="NOTB Fireworks is a leading fireworks Retailer and Warehouse in the Pocono's Lake Wallenpaupack region. We offer both Retail and Case-Lot options. Whether your need is casual, enthusiast, or professsional, we have the right stock and the right pricing structure to meet your needs."
	/>
</svelte:head>
<Hero {allData} />
<Container>
	<BreakRange {allData} />
	<HomeNews {allData} />
	<Featured {things} />
</Container>
