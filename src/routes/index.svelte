<script context="module">
	export async function load({ fetch }) {
		const { allData } = await fetch('/data/getAllContentful.json').then((results) => {
			return results.json();
		});

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
	export let allData;
	export let things;
</script>

<svelte:head>
	<title>North of the Border Fireworks</title>
	<meta
		name="description"
		content="NOTB Fireworks is a leading fireworks Retailer and Warehouse in the Pocono's Lake Wallenpaupack region. We offer both Retail and Case-Lot options. Whether your need is casual, enthusiast, or professsional, we have the right stock and the right pricing structure to meet your needs."
	/>
</svelte:head>
<Hero />
<Container>
	<HomeNews {allData} />
	<Featured {things} />
</Container>
