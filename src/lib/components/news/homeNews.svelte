<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;
</script>

<div>
	<h1>{allData.newsPosts.title}</h1>
	<SvelteMarkdown source={allData.newsPosts.body} />
</div>
