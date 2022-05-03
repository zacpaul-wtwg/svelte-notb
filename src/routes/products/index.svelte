<script context="module">
	export const prerender = true;
</script>

<script>
	const checkForUndefined = function (type) {
		if (type === undefined) {
			return 'unlisted';
		} else {
			return type;
		}
	};

	const setBrandForSearch = function (brand) {
		return 'deal-' + brand.replace(' FOR', '');
	};
	const stripSpaces = function (string) {
		return string.replace(' ', '');
	};

	const filterProducts = function (strings) {
		return function ({ title }) {
			const productSearchableParts = checkForUndefined(title).toLowerCase().split(' ');

			console.log(checkForUndefined(productSearchableParts));

			return strings.every((str) =>
				productSearchableParts.some((titlePart) => titlePart.startsWith(str))
			);
		};
	};

	export let products;
	let searchString = '';
	$: searchStrings = searchString.toLowerCase().split(' ');
	$: filteredProducts = products.productsFinal.filter(filterProducts(searchStrings));
</script>

<div class="search-params">
	<input type="text" bind:value={searchString} />
	<div>Showing {filterProducts.length} of {products.productsFinal.length} results</div>
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

<style lang="scss">
	.search-params {
		position: fixed;
		background-color: rgb(199, 199, 199);
		width: 100%;
		padding: 50px;
	}
</style>
