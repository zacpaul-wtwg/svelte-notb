<script context="module">
	export const prerender = true;
	export async function load({ fetch }) {
		const { products } = await fetch('/data/getAllProducts.json').then((result) => {
			return result.json();
		});

		return {
			props: {
				products
			}
		};
	}
</script>

<script>
	export let products;
	console.log(products);
</script>

{#each products as product}
	{product.title} <br />
{/each}
