<script context="module">
	export const prerender = true;
</script>

<script>
	import { slugify } from '$lib/utility/slugify';
	import MatchGroup from '$lib/matchGroup.svelte';
	import { filterProducts } from '$lib/filter-utils';
	import PageTitle from '$lib/components/title/PageTitle.svelte';

	export let products;
	export let availableFilters;
	$: categories = Object.keys(availableFilters);
	let seletedFilters = Object.keys(availableFilters).reduce(
		(value, key) => ({
			...value,
			[key]: []
		}),
		{}
	);
	$: readyFilters = Object.entries(seletedFilters).filter(([_, values]) => values.length > 0);
	let searchString = '';
	$: searchStrings = searchString.toLowerCase().split(' ');
	$: filteredProducts = products.filter(filterProducts(searchStrings, readyFilters));
</script>

<PageTitle pageTitle={'Products'} />

<div class="search-params">
	<input type="text" bind:value={searchString} />
	<div>Showing {filterProducts.length} of {products.length} results</div>
	<div>
		{#each categories as category}
			<MatchGroup
				label={category}
				values={availableFilters[category]}
				bind:selectedValues={seletedFilters[category]}
			/>
		{/each}
	</div>
</div>
<div>
	{#each filteredProducts as product}
		<div>
			<a
				sveltekit:prefetch
				href={`/products/${product.id}/${slugify(product.title)}`}
				target="_blank"
			>
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
		background-color: var(--off-white);
		width: 200px;
		right: 0;
		top: 0;
		bottom: 0;
		padding: 50px;
		overflow-y: auto;
	}
</style>
