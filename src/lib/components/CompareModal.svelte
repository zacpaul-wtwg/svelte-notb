<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import Container from '$lib/components/elements/Container.svelte';
	import { compare } from '$lib/stores.js';
	import { getThumb } from '$lib/utility/imageThumb';

	export let products = [];
	export let onClose = () => {};

	$: compareItems = Array.isArray($compare) ? $compare : [];
	$: selectedIds = new Set(compareItems.map((item) => item?.id));
	$: selectedFromRouteData = (products ?? []).filter((product) => selectedIds.has(product.id));
	$: selectedProducts = selectedFromRouteData.length > 0 ? selectedFromRouteData : compareItems;
	let hoverPreviewId = null;
	let pinnedPreviewId = null;

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

	const openHoverPreview = (id) => {
		if (pinnedPreviewId) return;
		hoverPreviewId = id;
	};

	const closeHoverPreview = (id) => {
		if (hoverPreviewId === id) hoverPreviewId = null;
	};

	const togglePinnedPreview = (id) => {
		pinnedPreviewId = pinnedPreviewId === id ? null : id;
	};

	const isPreviewOpen = (id) => hoverPreviewId === id || pinnedPreviewId === id;
</script>

<div class="modal-page">
	<div class="modal-frame">
		<div class="modal-backdrop" on:click={onClose}></div>
		<div class="modal compare-modal" role="dialog" aria-modal="true" aria-label="Item compare">
			<div class="modal-header">
				<h2>Item Compare</h2>
				<button class="modal-close" type="button" on:click={onClose}>×</button>
			</div>
			<div class="modal-body">
				<Container>
					{#if selectedProducts.length === 0}
						<p class="empty-state">
							No compare items selected yet. Add items from the <a href="/product">Product page</a>.
						</p>
					{:else}
						<div class="compare-table-wrap">
							<table class="compare-table">
								<thead>
									<tr>
										<th scope="col">Item</th>
										<th scope="col">Item Price</th>
									</tr>
								</thead>
								<tbody>
									{#each selectedProducts as product}
										<tr>
											<td class="item-cell">
												<div class="item-stage">
													<button
														type="button"
														class="item-card"
														aria-label={`Preview ${product.title || 'item'}`}
														on:mouseenter={() => openHoverPreview(product.id)}
														on:mouseleave={() => closeHoverPreview(product.id)}
														on:focus={() => openHoverPreview(product.id)}
														on:blur={() => closeHoverPreview(product.id)}
														on:click={() => togglePinnedPreview(product.id)}
													>
														<img
															class="item-thumb"
															loading="lazy"
															src={getThumb(product.imageThumb)}
															alt={product.title ? `${product.title} thumbnail` : 'Item thumbnail'}
														/>
														<div class="item-overlay">
															<div class="name-cell">{product.title || 'Unnamed item'}</div>
															<div class="category-cell">{product.category || 'Uncategorized'}</div>
														</div>
													</button>
													{#if isPreviewOpen(product.id)}
														<div class="preview-pop" transition:scale={{ duration: 120, start: 0.96 }}>
															<img
																class="preview-image"
																loading="lazy"
																src={getThumb(product.imageThumb)}
																alt={product.title ? `${product.title} enlarged preview` : 'Item enlarged preview'}
															/>
														</div>
													{/if}
												</div>
											</td>
											<td class="price-cell">{usd.format(product.price || 0)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</Container>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.modal-page {
		position: relative;
	}
	.modal-frame {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: calc(var(--nav-height) + 1.5em) 0 3.5em;
	}
	.modal-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		z-index: 1;
	}
	.modal {
		position: relative;
		transform: none;
		max-height: calc(100vh - var(--nav-height) - 5em);
		overflow: auto;
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 10px 10px 0 var(--yellow-accent);
		z-index: 2;
		padding: 0;
	}
	.compare-modal {
		width: min(96vw, 1480px);
	}
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1em;
		position: sticky;
		top: 0;
		background: var(--grey);
		color: var(--white);
		z-index: 5;
		padding: 0.75em 1.5em;
		border-top: 2px solid var(--white);
		border-left: 2px solid var(--white);
		border-right: 2px solid var(--white);
	}
	.modal-header h2 {
		margin: 0;
		text-transform: uppercase;
	}
	.modal-close {
		background: var(--white);
		color: var(--grey);
		border: none;
		width: 36px;
		height: 36px;
		font-size: 1.5em;
		cursor: pointer;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.modal-body {
		padding: 1.5em;
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
	.item-cell {
		min-width: 220px;
	}
	.item-stage {
		position: relative;
		width: 180px;
		height: 96px;
	}
	.item-card {
		position: relative;
		width: 180px;
		height: 96px;
		border: 1px solid var(--grey);
		padding: 0;
		background: var(--off-white);
		overflow: hidden;
		cursor: pointer;
	}
	.item-thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		background: var(--off-white);
	}
	.item-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.35rem 0.45rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.15));
		color: #fff;
	}
	.name-cell {
		font-weight: 700;
		font-size: 0.76rem;
		line-height: 1.15;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.category-cell {
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.preview-pop {
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translate(0.4rem, -50%);
		z-index: 8;
		width: 240px;
		height: 160px;
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 8px 8px 0 var(--yellow-accent);
		padding: 0.2rem;
	}
	.preview-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.price-cell {
		white-space: nowrap;
		font-family: 'SevenSegment', monospace;
		font-size: 1.15rem;
	}
	@media (max-width: 700px) {
		.modal-body {
			padding: 1rem 0.75rem;
		}
		.compare-table th,
		.compare-table td {
			padding: 0.55rem;
		}
		.item-stage,
		.item-card {
			width: 156px;
			height: 88px;
		}
		.preview-pop {
			position: fixed;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: min(86vw, 260px);
			height: min(56vw, 180px);
		}
	}
</style>
