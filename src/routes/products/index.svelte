<script context="module">
	export const prerender = true;
</script>

<script>
	import MatchGroup from '$lib/matchGroup.svelte';
	import { filterProducts } from '$lib/filter-utils';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';

	export let products;
	export let availableFilters;

	export let pricing = 'All Pricing';
	export let pricingOptions = ['All Pricing', '2 FOR 1', '3 FOR 1'];

	export let departments;
	export let department = 'All Departments';

	console.log(departments);

	$: categories = Object.keys(availableFilters);
	let selectedFilters = Object.keys(availableFilters).reduce(
		(value, key) => ({
			...value,
			[key]: []
		}),
		{}
	);
	$: readyFilters = Object.entries(selectedFilters).filter(([_, values]) => values.length > 0);
	let searchString = '';
	$: searchStrings = searchString.toLowerCase().split(' ');
	$: filteredProducts = products.filter(
		filterProducts(searchStrings, readyFilters, pricing, department)
	);
</script>

<TitleBar title="Products: {department}" />

<div class="search-params">
	<div class="filter-group">
		<h3>Search:</h3>
		<input type="text" bind:value={searchString} />
		{#if searchString.length > 0}
			<div>Showing {filteredProducts.length} results <br /> of {products.length} items</div>
		{/if}
	</div>

	<div class="filter-group">
		<label for="brand">
			<h3>Pricing:</h3>
		</label>
		<select bind:value={pricing}>
			{#each pricingOptions as item}
				<option value={item.replace(' 1', '')}>{item}</option>
			{/each}
		</select>
		(selected value: {pricing})
	</div>

	<div class="filter-group">
		<label for="departments">
			<h3>Departments:</h3>
		</label>
		<select bind:value={department}>
			<option value="All Departments">All Departments</option>
			{#each departments as dept}
				<option value={dept}>{dept}</option>
			{/each}
		</select>
		(selected value: {department})
	</div>

	<div class="boxes filter-group">
		{#each categories as category}
			<hr />
			<MatchGroup
				label={category}
				values={availableFilters[category]}
				bind:selectedValues={selectedFilters[category]}
			/>
		{/each}
	</div>
</div>

<div class="card-container">
	{#each filteredProducts as product}
		<ProductCard {product} />
	{/each}
</div>

<style lang="scss">
	.search-params {
		position: fixed;
		top: var(--nav-height);
		height: calc(100vh - var(--nav-height));
		width: 15em;
		padding: 1em 1em 1em 1em;
		background: var(--off-white);
		z-index: 2;
		overflow: scroll;
	}
	.boxes {
		margin-bottom: 3em;
	}
	.card-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 1.5em;
		padding: 1em;
		margin-left: 300px;
	}
	.filter-group {
		margin-top: 1em;
	}
	input,
	select {
		width: 12em;
	}
</style>
