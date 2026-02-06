<script>
	import { fallbackAllData as fallbackAllDataModule } from '$lib/cms/fallback';
	import HomeNews from '$lib/components/HomeNews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import Featured from '$lib/components/Featured.svelte';
	import BreakRange from '$lib/components/BreakRange.svelte';

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

		const productsData = await fetch('../data/getAllProducts.json').then((results) =>
			results.json()
		);

		return { props: { allData, productsData } };
	}

	export let allData = fallbackAllDataModule;
	export let productsData = { products: [] };
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
	<Featured {productsData} />
</Container>
