<script context="module">
	export async function load({ fetch }) {
		const { allData } = await fetch('/data/getAllContentful.json').then((results) => {
			return results.json();
		});

		return {
			props: {
				allData
			}
		};
	}
</script>

<script>
	import HomeNews from '$lib/components/news/homeNews.svelte';
	import Hero from '$lib/components/hero/Hero.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	export let allData;
</script>

<svelte:head>
	<title>NOTB Fireworks</title>
	<meta
		name="description"
		content="NOTB Fireworks is a leading fireworks Retailer and Warehouse in the Pocono's Lake Wallenpaupack region. We offer both Retail and Case-Lot options. Whether your need is casual, enthusiast, or professsional, we have the right stock and the right pricing structure to meet your needs."
	/>
</svelte:head>
<Hero />
<Container>
	<HomeNews {allData} />
</Container>
