<script context="module">
	export const prerender = true;
</script>

<script>
	export let products;
	//console.log(products);
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

//create checkboxes for all attributes //when check box is selected, create array of all selected
attributes //then iterate through products and check the custom attributes in each array if any
attributes in checkbox array matchers //display matching products
