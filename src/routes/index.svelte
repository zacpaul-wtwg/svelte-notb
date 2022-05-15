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
</svelte:head>
<Hero />
<Container>
	<HomeNews {allData} />
</Container>
