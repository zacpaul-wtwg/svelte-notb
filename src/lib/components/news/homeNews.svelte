<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;
</script>

<article>
	<section>
		<h1>{allData.newsPosts.title}</h1>
		<SvelteMarkdown source={allData.newsPosts.body} />
	</section>
</article>

<style>
	article {
		display: flex;
		justify-content: center;
	}
	section {
		width: 968px;
	}
</style>
