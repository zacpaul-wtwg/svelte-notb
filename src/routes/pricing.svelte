<script context="module">
	import Pricing from './pricing.svelte';
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
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let allData;
</script>

<PageTitle pageTitle={'Pricing'} />

{#each allData.pricing as entry}
	<section>
		<div>
			<h3>
				{entry.title}
			</h3>
			<p><SvelteMarkdown source={entry.entry} /></p>
		</div>
	</section>
{/each}

<style>
	:global(ul) {
		list-style: disc;
		padding-left: 2em;
	}
</style>
