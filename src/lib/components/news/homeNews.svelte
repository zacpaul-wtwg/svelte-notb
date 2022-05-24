<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;
</script>

<div>
	<div>
		<h2>{allData.newsPosts.title}</h2>
		<em>{allData.newsPosts.date}</em>
	</div>
	<SvelteMarkdown source={allData.newsPosts.body} />
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
		h1 {
			line-height: 1em;
		}
	}
</style>
