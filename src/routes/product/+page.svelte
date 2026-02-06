<script>
	// #region imports
import { fade, fly, slide } from 'svelte/transition';
	import MatchGroup from '$lib/matchGroup.svelte';
	import { filterProducts, sortProducts } from '$lib/filter-utils';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	// #endregion

	// #region props
	export let data;
	$: products = data?.products ?? [];
	$: availableFilters = data?.availableFilters ?? {};
	$: departments = data?.departments ?? [];
	$: departmentsAlphabetical = [...departments].sort();
	// #endregion

	// #region filters
	$: pricing = 'ALL PRICING';
	$: pricingOptions = ['ALL PRICING', '2 FOR 1', '3 FOR 1'];
	$: department = 'FEATURED';
	$: sortMethod = 'title';
	$: sortOptions = [
		{ display: 'LOWEST PRICE FIRST', value: 'lowestPriceFirst' },
		{ display: 'HIGHEST PRICE FIRST', value: 'highestPriceFirst' },
		{ display: 'NEWEST FIRST', value: 'newestFirst' },
		{ display: 'OLDEST FIRST', value: 'oldestFirst' }
	];

	$: categories = Object.keys(availableFilters);
	$: selectedFilters = Object.keys(availableFilters).reduce(
		(value, key) => ({
			...value,
			[key]: []
		}),
		{}
	);
	$: readyFilters = Object.entries(selectedFilters || {}).filter(([_, values]) => values.length > 0);
	$: searchString = '';
	$: searchStrings = searchString.toLowerCase().split(' ');
	$: filteredProducts = (products || []).filter(
		filterProducts(searchStrings, readyFilters, pricing, department)
	);
	$: sortedProducts = sortProducts(filteredProducts, sortMethod);
	$: featuredProducts = sortedProducts.filter((product) => product.featured === 'yes');
	let showAllProducts = false;
	let highlightDepartments = false;
	$: visibleProducts = showAllProducts ? sortedProducts : featuredProducts;
	$: filter = false;
	// #endregion
</script>

{#if filter}
	<div transition:fly={{ x: -400, duration: 1000 }} class="search-params">
		<div class="filter-group">
			<label for="search"> <h3>Search:</h3></label>
			<input id="search" type="text" bind:value={searchString} />
			{#if searchString.length > 0}
				<div>Showing {sortedProducts.length} results <br /> of {products.length} items</div>
			{/if}
		</div>

		<div class="filter-group">
			<label for="pricing">
				<h3>Pricing:</h3>
			</label>
			<select id="pricing" bind:value={pricing}>
				{#each pricingOptions as item}
					<option value={item.replace(' 1', '')}>
						{item === 'ALL PRICING' ? 'ALL' : item}
					</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="departments">
				<h3>Departments:</h3>
			</label>
			<select
				id="departments"
				class:highlight={highlightDepartments}
				bind:value={department}
			>
				<option value="FEATURED">FEATURED</option>
				<option value="ALL DEPARTMENTS">ALL</option>
				{#each departmentsAlphabetical as dept}
					<option value={dept}>{dept}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="sort-method">
				<h3>Sort By:</h3>
			</label>
			<select id="sort-method" bind:value={sortMethod}>
				<option value="title">TITLE</option>
				{#each sortOptions as sortOption}
					<option value={sortOption.value}>{sortOption.display}</option>
				{/each}
			</select>
		</div>

		<div class="boxes filter-group bottom-group">
			{#each categories as category}
				<details class="filter-group">
					<summary>{category}</summary>
					<MatchGroup
						label={category}
						values={availableFilters[category]}
						bind:selectedValues={selectedFilters[category]}
					/>
				</details>
			{/each}
		</div>
	</div>
{/if}

//buttons are

<button class="filter-pill" on:click={() => (filter = !filter)}>
	<span class="pill-icon" aria-hidden="true">
		<svg viewBox="0 0 24 24" role="img" focusable="false">
			<path
				d="M10 6a2 2 0 0 1 4 0h7v2h-7a2 2 0 0 1-4 0H3V6h7zm-2 10a2 2 0 0 0 4 0h9v-2h-9a2 2 0 0 0-4 0H3v2h5z"
			/>
		</svg>
	</span>
	<span class="pill-text">Filters</span>
</button>
<div
	class="detoggle"
	role="button"
	tabindex="0"
	aria-label="Toggle filters"
	on:click={() => (filter ? (filter = !filter) : filter)}
	on:keydown={(event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			filter ? (filter = !filter) : filter;
		}
	}}
>
	<div>
		<TitleBar title="Products: {department}" subtitle="Pricing: {pricing}" />
	</div>

	<div class="card-container {filter ? 'no-scroll' : 'scroll'}">
		{#if !showAllProducts}
			<div class="load-all" transition:slide={{ duration: 300 }}>
				<p>Showing featured products only.</p>
				<button
					type="button"
					class="load-all-button"
					on:click|stopPropagation={() => {
						showAllProducts = true;
						filter = true;
						department = 'ALL DEPARTMENTS';
						highlightDepartments = true;
						if (typeof window !== 'undefined') {
							window.setTimeout(() => (highlightDepartments = false), 4000);
						}
					}}
				>
					See All Products
				</button>
			</div>
		{/if}
		{#each visibleProducts as product}
			<ProductCard {product} />
		{/each}
	</div>
</div>

<style lang="scss">
	// #region buttons
	button {
		color: var(--white);
		text-decoration: none;
		padding: 0.5em 2em 0.5em 2em;
		margin-top: 25px;
		font-family: Langdon;
		text-transform: uppercase;
		font-size: 2em;
		transition: 0.4s;
		box-shadow: inset 0px 0px 0px 5px rgb(255, 255, 255);
		background: var(--grey);
		cursor: pointer;
		display: block;
	}
	button:hover {
		color: var(--white);
		background-color: var(--grey);
		box-shadow: none;
	}
	// #endregion

	.search-params {
		position: fixed;
		top: calc(var(--nav-bottom) + var(--nav-top));
		height: calc(100vh - var(--nav-height));
		width: 13em;
		padding: 4.25em 1em 1.5em 1em;
		background: var(--off-white);
		box-shadow: inset -1px 0 0 var(--grey), 4px 0 12px rgba(0, 0, 0, 0.08);
		border-right: 1px solid var(--grey);
		z-index: 6;
		overflow: scroll;
	}
	.bottom-group {
		padding-bottom: 10em;
	}
	.boxes {
		margin-bottom: 3em;
	}
	.card-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 2em;
		padding: 1em;
		justify-content: center;
		margin-top: 0.5em;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}
	.load-all {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 0.5em;
		padding: 1em 0;
	}
	.load-all-button {
		padding: 0.6em 1.5em;
		font-size: 1.1em;
		border: 2px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		cursor: pointer;
		text-transform: uppercase;
		box-shadow: 4px 4px 0 var(--yellow-accent);
	}
	.load-all-button:hover {
		background: var(--grey);
		color: var(--white);
	}
	@keyframes pulseHighlight {
		0% {
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
		}
		50% {
			box-shadow: 0 0 0 6px rgba(0, 0, 0, 1);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
		}
	}
	select.highlight {
		animation: pulseHighlight 0.6s steps(1, end) 6;
		border-color: var(--grey);
	}
	.detoggle {
		display: block;
		width: 100%;
		border: 0;
		background: transparent;
		text-align: left;
		padding: 0;
	}
	.filter-group {
		margin-top: 1em;
	}
	details.filter-group {
		border: 1px solid var(--grey);
		border-left: 4px solid var(--yellow-accent);
		border-radius: 0;
		padding: 0.5em 0.75em;
		background: var(--white);
	}
	details.filter-group summary {
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		list-style: none;
	}
	details.filter-group summary::-webkit-details-marker {
		display: none;
	}
	details.filter-group summary::after {
		content: '+';
		float: right;
	}
	details[open].filter-group summary::after {
		content: '–';
	}
	input,
	select {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		border: 1px solid var(--grey);
		background: var(--white);
		padding: 0.4em 0.5em;
		font-family: Langdon;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.filter-group h3 {
		margin: 0 0 0.35em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.95em;
		color: var(--grey);
	}
	.filter-group label {
		display: block;
	}
	.filter-pill {
		position: fixed;
		top: calc(var(--nav-height) + 1.5em);
		left: 0;
		z-index: 10;
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
		background: var(--grey);
		color: var(--white);
		border: none;
		border-radius: 0 999px 999px 0;
		padding: 0.6em 1.1em;
		font-family: Langdon;
		text-transform: uppercase;
		font-size: 1.1em;
		cursor: pointer;
		box-shadow: 4px 4px 0 var(--yellow-accent);
		transition: background 0.2s ease;
	}
	.filter-pill .pill-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.8em;
		height: 1.8em;
		border-radius: 999px;
		background: var(--white);
		color: var(--grey);
		font-weight: 900;
		font-size: 1.1em;
	}
	.filter-pill .pill-icon svg {
		width: 1.1em;
		height: 1.1em;
		fill: currentColor;
	}
	.filter-pill:hover {
		background: var(--grey);
	}

	:global(.detoggle .main-container) {
		justify-content: center;
	}
	.detoggle {
		position: relative;
	}
	// .no-scroll {
	// 	@media screen and (max-width: 400px) {
	// 		width: 0px;
	// 		height: 0px;
	// 		overflow: hidden;
	// 		visibility: hidden;
	// 	}
	// }
</style>
