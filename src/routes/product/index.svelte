<script context="module">
	export const prerender = true;
</script>

<script>
	import { fly } from 'svelte/transition';
	import MatchGroup from '$lib/matchGroup.svelte';
	import { filterProducts, sortProducts } from '$lib/filter-utils';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';

	export let products;
	export let availableFilters;

	export let pricing = 'ALL PRICING';
	export let pricingOptions = ['ALL PRICING', '2 FOR 1', '3 FOR 1'];

	export let departments;
	export let department = 'ALL DEPARTMENTS';

	export let sortMethod = 'title';
	export let sortOptions = [
		{ display: 'LOWEST PRICE FIRST', value: 'lowestPriceFirst' },
		{ display: 'HIGHEST PRICE FIRST', value: 'highestPriceFirst' },
		{ display: 'NEWEST FIRST', value: 'newestFirst' },
		{ display: 'OLDEST FIRST', value: 'oldestFirst' }
	];

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
	$: sortedProducts = sortProducts(filteredProducts, sortMethod);
	$: filter = true;
</script>

{#if filter}
	<div transition:fly={{ x: -400, duration: 1000 }} class="search-params">
		<div class="filter-group">
			<h3>Search:</h3>
			<input type="text" bind:value={searchString} />
			{#if searchString.length > 0}
				<div>Showing {sortedProducts.length} results <br /> of {products.length} items</div>
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
		</div>

		<div class="filter-group">
			<label for="departments">
				<h3>Departments:</h3>
			</label>
			<select bind:value={department}>
				<option value="ALL DEPARTMENTS">ALL DEPARTMENTS</option>
				{#each departments as dept}
					<option value={dept}>{dept}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="departments">
				<h3>Sort By:</h3>
			</label>
			<select bind:value={sortMethod}>
				<option value="title">TITLE</option>
				{#each sortOptions as sortOption}
					<option value={sortOption.value}>{sortOption.display}</option>
				{/each}
			</select>
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
{/if}

{#if filter}
	<button
		transition:fly={{ x: -400, duration: 1000 }}
		class="filter-toggle filter-on"
		on:click={() => (filter = !filter)}
	>
		Hide Filters
	</button>
{:else}
	<button
		transition:fly={{ x: -400, duration: 1000 }}
		class="filter-toggle filter-off"
		on:click={() => (filter = !filter)}
	>
		Show Filters
	</button>
{/if}
<div class="detoggle" on:click={() => (filter ? (filter = !filter) : filter)}>
	<div>
		<TitleBar title="Products: {department}" subtitle="Pricing: {pricing}" />
	</div>

	<div class="card-container">
		{#each sortedProducts as product}
			<ProductCard {product} />
		{/each}
	</div>
</div>

<style lang="scss">
	.search-params {
		position: fixed;
		top: var(--nav-height);
		height: calc(100vh - var(--nav-height));
		width: 15em;
		padding: 4em 1em 1em 1em;
		background: var(--off-white);
		z-index: 6;
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
		justify-content: center;
		margin-top: 1em;
	}
	.filter-group {
		margin-top: 1em;
	}
	input,
	select {
		width: 12em;
	}
	.filter-toggle {
		position: fixed;
		z-index: 10;
		margin-left: 1em;
		font-size: 1.5em;
	}
	.filter-on {
		top: 2em;
	}
	.filter-off {
		bottom: 1em;
	}

	:global(.detoggle .main-container) {
		justify-content: center;
	}
	.detoggle {
		position: relative;
	}
</style>
