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
	import Accordion from '$lib/components/accordion.svelte';
	export let allData;
</script>

<section>
	{#each allData.faq as entry}
		<Accordion title={entry.title} answer={entry.answer} />
	{/each}
</section>
