<script>
	import { fallbackAllData as fallbackAllDataModule } from '$lib/cms/fallback';

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
	import { renderMarkdown } from '$lib/markdown';
	import { fallbackAllData } from '$lib/cms/fallback';
	export let allData = fallbackAllData;
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
					<div class="md">{@html renderMarkdown(entry.entry)}</div>
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
