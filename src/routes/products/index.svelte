<script>
	// Made by Kevin Åberg Kultalahti
	// Twitter: @kevmodrome
	// Don't miss Svelte Summit: https://sveltesummit.com

	import { fetchProducts } from '@stores';
	let data = [];
	console.log(fetchProducts().then((result) => (data = result)));
</script>

<pre>  {JSON.stringify(data)} </pre>
