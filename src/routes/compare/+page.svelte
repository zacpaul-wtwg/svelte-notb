<script>
	import { onMount } from 'svelte';
	import { compare } from '$lib/stores.js';
	import { getThumb } from '$lib/utility/imageThumb';

	export let data;
	$: products = data?.products ?? [];
	$: selectedIds = new Set(($compare ?? []).map((item) => item?.id));
	$: selectedProducts = products.filter((product) => selectedIds.has(product.id));

	const usd = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	onMount(() => {
		try {
			const parsed = JSON.parse(localStorage.getItem('compare') ?? '[]');
			$compare = Array.isArray(parsed) ? parsed : [];
		} catch {
			$compare = [];
		}
	});
</script>

<section class="container">
	<div class="container-contents compare-page">
		<h1>Item Compare</h1>

		{#if selectedProducts.length === 0}
			<p class="empty-state">
				No compare items selected yet. Add items from the <a href="/product">Product page</a>.
			</p>
		{:else}
			<div class="compare-table-wrap">
				<table class="compare-table">
					<thead>
						<tr>
							<th scope="col">Thumbnail</th>
							<th scope="col">Item Name</th>
							<th scope="col">Item Price</th>
						</tr>
					</thead>
					<tbody>
						{#each selectedProducts as product}
							<tr>
								<td class="thumb-cell">
									<img
										class="item-thumb"
										loading="lazy"
										src={getThumb(product.imageThumb)}
										alt={product.title ? `${product.title} thumbnail` : 'Item thumbnail'}
									/>
								</td>
								<td class="name-cell">{product.title || 'Unnamed item'}</td>
								<td class="price-cell">{usd.format(product.price || 0)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>

<style>
	.compare-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.compare-page h1 {
		margin: 0;
	}

	.empty-state {
		margin: 0;
		color: var(--grey-accent);
	}

	.compare-table-wrap {
		width: 100%;
		overflow-x: auto;
		border: 1px solid var(--grey);
		background: var(--white);
	}

	.compare-table {
		width: 100%;
		min-width: 580px;
		border-collapse: collapse;
	}

	.compare-table th,
	.compare-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--grey-light);
		text-align: left;
		vertical-align: middle;
	}

	.compare-table th {
		background: var(--grey);
		color: var(--white);
	}

	.compare-table tbody tr:last-child td {
		border-bottom: 0;
	}

	.thumb-cell {
		width: 110px;
	}

	.item-thumb {
		width: 88px;
		height: 88px;
		object-fit: cover;
		display: block;
		border: 1px solid var(--grey-light);
		background: var(--off-white);
	}

	.name-cell {
		font-weight: 700;
	}

	.price-cell {
		white-space: nowrap;
		font-family: 'SevenSegment', monospace;
		font-size: 1.15rem;
	}

	@media (max-width: 700px) {
		.compare-page {
			gap: 0.75rem;
		}

		.compare-table th,
		.compare-table td {
			padding: 0.55rem;
		}

		.item-thumb {
			width: 72px;
			height: 72px;
		}
	}
</style>
