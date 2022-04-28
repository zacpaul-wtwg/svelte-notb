<script context="module">
	export const prerender = true;
</script>

<script>
	export let products;
	console.log(products);
</script>

{#each products.productsFinal as product}
	<div>
		<a sveltekit:prefetch href={`/products/${product.id}`}>
			<h2>{product.title}</h2>
			<p>{product.description}</p>
			<br />
			<img src={product.imageThumb} alt="{product.title} IMAGE" />
			<br />
			<hr />
		</a>
	</div>
{/each}
