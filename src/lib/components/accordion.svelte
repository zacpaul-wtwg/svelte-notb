<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let title;
	export let answer;
</script>

<div>
	<h2>{title}</h2>
	<p><SvelteMarkdown source={answer} /></p>
</div>

<style>
	div {
		display: block;
		max-width: 1024px;
	}
</style>
