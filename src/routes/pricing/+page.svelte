<script>
import Container from '$lib/components/elements/Container.svelte';
import PageTitle from '$lib/components/PageTitle.svelte';
import TitleBar from '$lib/components/TitleBar.svelte';
import { renderMarkdown } from '$lib/markdown';
import { fallbackAllData } from '$lib/cms/fallback';

export let data;
$: allData = data?.allData ?? fallbackAllData;
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
