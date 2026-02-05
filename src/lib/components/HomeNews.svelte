<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;

	const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
</script>

<div>
	<div>
		<h2>{allData.newsPosts.title}</h2>
		<em>{allData.newsPosts.date}</em>
	</div>
	{#if looksLikeHtml(allData.newsPosts.body)}
		<div class="news-body">{@html allData.newsPosts.body}</div>
	{:else}
		<SvelteMarkdown source={allData.newsPosts.body} />
	{/if}
</div>

<style lang="scss">
	div > div {
		transform: rotate(-7deg);
		background: var(--grey);
		display: inline-flex;
		padding: 0.25em 1em 0 1em;
		position: relative;
		top: -28px;
		left: -1em;
		color: var(--white);
		flex-direction: column;
		align-items: flex-end;
		h2 {
			line-height: 1em;
		}
	}
</style>
