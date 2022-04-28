<script context="module">
	export const prerender = true;
</script>

<script>
	const filterProducts =
		(strings) =>
		({ title }) => {
			const productTitleParts = title.toLowerCase().split(' ');
			return strings.every((str) =>
				productTitleParts.some((titlePart) => titlePart.startsWith(str))
			);
		};

	export let products;
	let searchString = '';
	$: searchStrings = searchString.toLowerCase().split(' ');
	$: filteredProducts = products.filter(filterProducts(searchStrings));
</script>

<div>
	<input type="text" bind:value={searchString} />
	<div>Showing {filterProducts.length} of {products.length} results</div>
</div>
<div>
	{#each filteredProducts as product}
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
</div>
