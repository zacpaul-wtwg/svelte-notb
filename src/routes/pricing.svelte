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
	import Container from '$lib/components/elements/Container.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let allData;
</script>

<TitleBar
	title={'Pricing'}
	description={'See our vip loyalty program, high roller rollback program, and camp and military discount information'}
/>
<Container>
	<section>
		{#each allData.pricing as entry}
			<article>
				<div>
					<h3>
						{entry.title}
					</h3>
					<p class="md"><SvelteMarkdown source={entry.entry} /></p>
				</div>
			</article>
		{/each}
	</section>
</Container>

<style>
	.md > :global(ul) {
		list-style: disc;
		padding-left: 2em;
	}
	section {
		flex-direction: column;
	}
</style>
