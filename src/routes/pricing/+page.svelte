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
	<section class="pricing-grid">
		{#each allData.pricing as entry}
			<article class="pricing-card">
				<header class="card-header">
					<h3>{entry.title}</h3>
				</header>
				<div class="card-body">
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
	.pricing-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.2em;
	}
	.pricing-card {
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}
	.card-header {
		background: var(--grey);
		color: var(--white);
		padding: 0.6em 0.9em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-bottom: 2px solid var(--white);
	}
	.card-header h3 {
		margin: 0;
		font-family: Langdon, Arial, sans-serif;
	}
	.card-body {
		padding: 0.9em 1em 1.1em;
		color: var(--grey);
	}
	.card-body :global(p) {
		margin: 0 0 0.8em 0;
		line-height: 1.5;
	}
	.card-body :global(ul) {
		margin: 0.4em 0 0.8em;
	}
	@media (max-width: 640px) {
		.card-header {
			padding: 0.5em 0.8em;
		}
		.card-body {
			padding: 0.8em 0.9em 1em;
		}
	}
</style>
