<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;
</script>

<div>
	<h1>{allData.newsPosts.title}</h1>
	<SvelteMarkdown source={allData.newsPosts.body} />
</div>

<style>
	h1 {
		transform: rotate(-7deg);
		background: var(--grey);
		display: inline-block;
		padding: 0.25em 1em 0 1em;
		position: relative;
		top: -28px;
		left: -1em;
		color: var(--white);
	}
</style>
