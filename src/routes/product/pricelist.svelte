<script context="module">
	export async function load({ fetch }) {
		const { things } = await fetch('../data/getAllProducts.json').then((results) => {
			return results.json();
		});

		return {
			props: {
				things
			}
		};
	}
</script>

<script>
	import ColumnButton from '$lib/components/ColumnButton.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';

	export const verticalize = function (array) {
		return array.join(', ');
	};

	$: description = false;
	$: effects = false;
	$: colors = false;
	$: sounds = false;

	export let things;
	export let departments = things.departments.sort();

	$: departmentFilter = 'all departments';
	$: products = things.products;
	$: departmentFilter;
	$: filteredProducts = products;
	$: sortedProducts = filteredProducts
		.filter((x) => x.category === departmentFilter || departmentFilter === 'all departments')
		.sort();

	console.log(departments);
</script>

<TitleBar title={'Price List'} description="North of the Border Printable Price List. " />
<Container>
	<div on:click={() => window.print()}>
		<Button>Print</Button>
	</div>

	<label for="department-filter"><h3>Department Filter:</h3></label>
	<select
		name="department-filter"
		id="department-filter"
		bind:value={departmentFilter}
		class="noprint"
	>
		<option value="all departments" default>ALL DEPARTMENTS</option>
		{#each departments as department}
			<option value={department}>{department}</option>
		{/each}
	</select>
	<hr class="noprint" />
	<!-- //TODO: refactor buttons, create component. -->

	<ColumnButton bind:toggle={description} title={'description'} />
	<ColumnButton bind:toggle={effects} title={'effects'} />
	<ColumnButton bind:toggle={colors} title={'colors'} />
	<ColumnButton bind:toggle={sounds} title={'sounds'} />

	<div class="noprint">
		<p>
			If you select too many columns for your printable pricelist, you may need to set your
			print-job to landscape. This may result in a larger print job. To reduce the amount of
			printing you have to do, remove columns and set to portrait.
		</p>
		<p><strong>Information below the line will print.</strong></p>
	</div>
	<hr class="noprint" />
	<img src="/logo_large_inverse.png" alt="North of the Border Logo" />
	<p>
		These prices are current as of, <strong>{new Date().toDateString()}</strong>. The information
		here is updated automatically whenever it is changed in the store on our point-of-sale system.
		Prices and availability are subject to change and the price is not guaranteed at the counter.
	</p>
	<h2 class="doprint">{departmentFilter}</h2>
	<table id="tg-1oY8l" class="tg table-sort remember-sort">
		<thead>
			<tr>
				<th class="tg-0lax disable-sort">ID</th>
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

	.tg .tg-0lax {
		text-align: left;
		vertical-align: top;
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
		.doprint {
			display: block !important;
			font-family: sans-serif;
			font-weight: 900;
		}
	}
</style>
