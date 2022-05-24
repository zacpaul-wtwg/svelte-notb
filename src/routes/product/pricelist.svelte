<script context="module">
	export async function load({ fetch }) {
		const { products } = await fetch('../data/getAllProducts.json').then((results) => {
			return results.json();
		});

		return {
			props: {
				products
			}
		};
	}
</script>

<script>
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { sortProducts } from '$lib/filter-utils';

	export const verticalize = function (array) {
		return array.join(', ');
	};

	$: description = false;
	$: effects = false;
	$: colors = false;
	$: sounds = false;

	console.log();
	export let products;
	export let sortedProducts = products.sort();
</script>

<svelte:head><meta charset="UTF-8" /></svelte:head>

<TitleBar title={'Price List'} description="North of the Border Printable Price List. " />
<Container>
	<button on:click={() => window.print()}>Print</button>
	<!-- //TODO: refactor buttons, create component. -->
	<button
		class:description
		class="column-selector"
		on:click={() => {
			description = !description;
		}}
	>
		<span class:description>add<br /></span>
		<span class:description={!description}>remove<br /></span>
		description
	</button>

	<button
		class:effects
		class="column-selector"
		on:click={() => {
			effects = !effects;
		}}
	>
		<span class:effects>add<br /></span>
		<span class:description={!effects}>remove<br /></span>
		effects
	</button>

	<button
		class:colors
		class="column-selector"
		on:click={() => {
			colors = !colors;
		}}
	>
		<span class:colors>add<br /></span>
		<span class:description={!colors}>remove<br /></span>
		colors
	</button>

	<button
		class:sounds
		class="column-selector"
		on:click={() => {
			sounds = !sounds;
		}}
	>
		<span class:sounds>add<br /></span>
		<span class:description={!sounds}>remove<br /></span>
		sounds
	</button>

	<p class="noprint">
		If you select too many columns for your printable pricelist, you may need to set your print-job
		to landscape. This may result in a larger print job. To reduce the amount of printing you have
		to do, remove columns and set to portrait.
	</p>
	<p><strong>Information below the line will print.</strong></p>
	<hr />
	<img src="/logo_large_inverse.png" alt="North of the Border Logo" />
	<p>
		These prices are current as of, <strong>{new Date().toDateString()}</strong>. The information
		here is updated automatically whenever it is changed in the store on our point-of-sale system.
		Prices and availability are subject to change and the price is not guaranteed at the counter.
	</p>
	<table id="tg-1oY8l" class="tg table-sort remember-sort">
		<thead>
			<tr>
				<th class="tg-0pky disable-sort">ID</th>
				<th class="tg-0lax">Title</th>
				<th class="tg-0lax">Department</th>
				<th class="tg-0lax">Pricing</th>
				<th class="tg-0lax">Price</th>
				{#if description}
					<th class="tg-0lax">Description</th>
				{/if}
				{#if effects}
					<th class="tg-0lax">Effects</th>
				{/if}
				{#if colors}
					<th class="tg-0lax">Colors</th>
				{/if}
				{#if sounds}
					<th class="tg-0lax">Sounds</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each sortedProducts as product}
				<tr>
					<td class="tg-0lax">{product.id}</td>
					<td class="tg-0lax">{product.title}</td>
					<td class="tg-0lax">{product.category}</td>
					<td class="tg-0lax">{product.deal}</td>
					<td class="tg-0lax">{product.price.toFixed(2)}</td>
					{#if description}
						<td class="tg-0lax">{product.description}</td>
					{/if}
					{#if effects}
						<td class="tg-0lax">
							{#each product.effects as effect}
								{effect}<br />
							{/each}
						</td>
					{/if}
					{#if colors}
						<td class="tg-0lax">
							{#each product.colors as color}
								{color}<br />
							{/each}
						</td>
					{/if}
					{#if sounds}
						<td class="tg-0lax">
							{#each product.sounds as sound}
								{sound}<br />
							{/each}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</Container>

<style lang="scss">
	.tg {
		border-collapse: collapse;
		border-spacing: 0;
	}
	.tg td {
		border-color: black;
		border-style: solid;
		border-width: 1px;
		font-family: Arial, sans-serif;
		font-size: 14px;
		overflow: hidden;
		padding: 10px 5px;
		word-break: normal;
	}
	.tg th {
		border-color: black;
		border-style: solid;
		border-width: 1px;
		font-family: Arial, sans-serif;
		font-size: 14px;
		font-weight: normal;
		overflow: hidden;
		padding: 10px 5px;
		word-break: normal;
	}
	.tg .tg-0pky {
		border-color: inherit;
		text-align: left;
		vertical-align: top;
	}
	.tg .tg-0lax {
		text-align: left;
		vertical-align: top;
	}
	.tg-sort-header::-moz-selection {
		background: 0 0;
	}
	.tg-sort-header::selection {
		background: 0 0;
	}
	.tg-sort-header {
		cursor: pointer;
	}
	.tg-sort-header:after {
		content: '';
		float: right;
		margin-top: 7px;
		border-width: 0 5px 5px;
		border-style: solid;
		border-color: #404040 transparent;
		visibility: hidden;
	}
	.tg-sort-header:hover:after {
		visibility: visible;
	}
	.tg-sort-asc:after,
	.tg-sort-asc:hover:after,
	.tg-sort-desc:after {
		visibility: visible;
		opacity: 0.4;
	}
	.tg-sort-desc:after {
		border-bottom: none;
		border-width: 5px 5px 0;
	}

	tr:nth-child(odd) {
		background: var(--grey-light);
	}

	th {
		color: white;
		background: var(--grey);
		text-transform: uppercase;
		font-size: 1em !important;
		letter-spacing: 0.1em;
	}
	button {
		margin: 1em;
		transition: ease 0s !important;
	}
	.column-selector {
		font-size: 1em;
		font-family: sans-serif;
		border: none;
		display: inline-block;
	}

	span.colors,
	span.sounds,
	span.effects,
	span.description {
		display: none;
	}

	button.description,
	button.effects,
	button.sounds,
	button.colors {
		background-color: var(--red);
		border: 0.25em solid var(--red);
		margin: 0.75em;
	}

	img {
		width: 30%;
	}

	@media print {
		tr:nth-child(odd) {
			background: var(--grey-light);
			-webkit-print-color-adjust: exact;
		}
		th {
			color: white;
			background: var(--grey);
		}
		:global(header, footer, h1, h2, h3, h4, h5, h6, button, span) {
			display: none !important;
		}
		table {
			height: 100%;
			max-width: 100%;
		}
		.noprint {
			display: none;
		}
	}
</style>
