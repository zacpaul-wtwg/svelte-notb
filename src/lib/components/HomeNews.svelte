<script>
	import { renderMarkdown } from '$lib/markdown';
	export let allData;

	const formatNewsDate = (value) => {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	};

	const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
</script>

<article class="news-card">
	<header class="news-header">
		<div class="title-wrap">
			<h2>{allData.newsPosts.title}</h2>
			{#if allData.newsPosts.date}
				<span class="news-date">{formatNewsDate(allData.newsPosts.date)}</span>
			{/if}
		</div>
		<span class="news-kicker">News Post</span>
	</header>
	<div class="news-body">
		{#if looksLikeHtml(allData.newsPosts.body)}
			<div class="md">{@html allData.newsPosts.body}</div>
		{:else}
			<div class="md">{@html renderMarkdown(allData.newsPosts.body)}</div>
		{/if}
	</div>
</article>

<style lang="scss">
	.news-card {
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
	}
	.news-header {
		background: var(--grey);
		color: var(--white);
		padding: 0.85em 1.25em;
		display: flex;
		justify-content: space-between;
		gap: 1em;
		align-items: flex-end;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.title-wrap h2 {
		margin: 0;
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.25em;
		line-height: 1.1;
	}
	.news-date {
		display: block;
		font-size: 0.8em;
		color: var(--yellow-accent);
		margin-top: 0.2em;
	}
	.news-kicker {
		font-size: 0.75em;
		color: var(--yellow-accent);
	}
	.news-body {
		padding: 1.25em 1.4em 1.6em;
		color: var(--grey);
		font-size: 0.98em;
	}
	.news-body :global(h3),
	.news-body :global(h4) {
		margin: 1em 0 0.45em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.9em;
		border-bottom: 1px solid var(--grey);
		padding-bottom: 0.25em;
	}
	.news-body :global(p) {
		margin: 0 0 0.9em 0;
		line-height: 1.65;
	}
	.news-body :global(ul) {
		margin: 0.5em 0 0.9em;
		padding-left: 2em;
		list-style: disc;
	}
	.news-body :global(ol) {
		margin: 0.5em 0 0.9em;
		padding-left: 2em;
		list-style: decimal;
	}
	.news-body :global(li) {
		list-style-position: outside;
		margin: 0.2em 0;
	}
	.news-body :global(li[data-list='bullet']) {
		list-style-type: disc;
	}
	.news-body :global(li[data-list='ordered']) {
		list-style-type: decimal;
	}
</style>
