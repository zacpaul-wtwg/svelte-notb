<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;
</script>

<h1>{allData.newsPosts.title}</h1>
<SvelteMarkdown source={allData.newsPosts.body} />
