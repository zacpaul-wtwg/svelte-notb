<script>
	// Made by Kevin Åberg Kultalahti
	// Twitter: @kevmodrome
	// Don't miss Svelte Summit: https://sveltesummit.com

	import { fetchProducts } from '@stores';
	import { empty } from 'svelte/internal';
	let data = [];
	fetchProducts().then((result) => (data = result));
</script>

{#if data.length === 0}
	The products are loading
{:else}
	<pre>  {JSON.stringify(data)} </pre>
{/if}
