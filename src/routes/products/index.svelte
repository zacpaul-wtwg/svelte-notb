<script>
	import { fetchProducts } from '$stores';
	let products = [];
	fetchProducts().then((result) => (products = result));
</script>

{#if products.length === 0}
	The products are loading
{:else}
	{#each products as product}
		{product.title} <br />
	{/each}
{/if}
