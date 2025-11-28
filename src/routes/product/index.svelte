<script context="module">
	export const prerender = true;
</script>

<script>
	// #region imports
	import { fly } from 'svelte/transition';
	import MatchGroup from '$lib/matchGroup.svelte';
	import { filterProducts, sortProducts } from '$lib/filter-utils';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	// #endregion

	// #region props
	export let products;
	export let availableFilters;
	export let departments;
	$: departmentsAlphabetical = departments.sort();
	// #endregion

	// #region filters
	$: pricing = 'ALL PRICING';
	$: pricingOptions = ['ALL PRICING', '2 FOR 1', '3 FOR 1'];
	$: department = 'ALL DEPARTMENTS';
	$: sortMethod = 'title';
	$: sortOptions = [
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
	$: searchString = '';
	$: searchStrings = searchString.toLowerCase().split(' ');
	$: filteredProducts = products.filter(
		filterProducts(searchStrings, readyFilters, pricing, department)
	);
	$: sortedProducts = sortProducts(filteredProducts, sortMethod);
	$: filter = true;
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
					<option value={item.replace(' 1', '')}>{item}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="departments">
				<h3>Departments:</h3>
			</label>
			<select id="departments" bind:value={department}>
				<option value="ALL DEPARTMENTS">ALL DEPARTMENTS</option>
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

//buttons are

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

        <div class="pricelist-callout">
                <p>
                        Our online catalog will be back up as soon as possible. In the meantime, you can download
                        the latest price list below.
                </p>
                <a
                        class="download-button"
                        href="/PriceList.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                >
                        Download Price List (PDF)
                </a>
        </div>

        <div class="card-container {filter ? 'no-scroll' : 'scroll'}">
                {#each sortedProducts as product}
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
		width: 15em;
		padding: 4em 1em 1em 1em;
		background: var(--off-white);
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
                top: 3.5em;
        }
        .filter-off {
                bottom: 1em;
        }

        .pricelist-callout {
                background: var(--off-white);
                border: 4px solid var(--grey);
                padding: 1.5em;
                margin: 1.5em auto;
                max-width: 50rem;
                text-align: center;
                box-shadow: 0 0.75em 1.5em rgba(0, 0, 0, 0.15);
        }

        .pricelist-callout p {
                font-size: 1.1em;
                margin-bottom: 1em;
        }

        .download-button {
                display: inline-block;
                color: var(--white);
                text-decoration: none;
                padding: 0.5em 2em 0.5em 2em;
                font-family: Langdon;
                text-transform: uppercase;
                font-size: 1.5em;
                transition: 0.4s;
                box-shadow: inset 0px 0px 0px 5px rgb(255, 255, 255);
                background: var(--grey);
        }

        .download-button:hover {
                color: var(--white);
                background-color: var(--grey);
                box-shadow: none;
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
