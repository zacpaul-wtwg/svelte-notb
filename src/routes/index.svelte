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
	import PageTitle from '$lib/components/title/PageTitle.svelte';
	export let allData;
</script>

<PageTitle pageTitle={'Home'} />
<Hero />
<HomeNews {allData} />
