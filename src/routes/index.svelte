<script context="module">
	export const prerender = true;

	export async function load({ fetch }) {
		const [{ allData }] = await Promise.all([
			fetch('/data/getAllContentful.json').then((results) => results.json())
		]);
		return {
			props: {
				allData
			}
		};
	}
</script>

<script>
	import HomeNews from '$lib/news/homeNews.svelte';
	export let allData;
</script>

<HomeNews {allData} />
