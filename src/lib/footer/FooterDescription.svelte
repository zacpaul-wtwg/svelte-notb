<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;
</script>

<h2>{allData.footerDescription.title}</h2>
<SvelteMarkdown source={allData.footerDescription.body} />
