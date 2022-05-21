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
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	export let allData;
</script>

<TitleBar
	title={'Frequently Asked Questions'}
	description={'Frequently asked questions about the PA state laws, the safe use of fireworks, our pricing options, and more.'}
/>
<Container>
	<section>
		{#each allData.faq as entry}
			<article>
				<Accordion title={entry.title} answer={entry.answer} />
			</article>
		{/each}
	</section>
</Container>
