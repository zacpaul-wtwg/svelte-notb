<script context="module">
	export async function load({ fetch }) {
		const { newsPosts } = await fetch('/data/newsPosts.json').then((results) => results.json());
		return {
			props: {
				newsPosts
			}
		};
	}
</script>

<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let newsPosts;

	export const body = newsPosts.items[0].fields.body;
	export const title = newsPosts.items[0].fields.title;
</script>

<h1>{title}</h1>
<SvelteMarkdown source={body} />
