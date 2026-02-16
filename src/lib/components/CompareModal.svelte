<script>
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Container from '$lib/components/elements/Container.svelte';
	import ColorDots from '$lib/components/ColorDots.svelte';
	import { compare } from '$lib/stores.js';
	import { sanitizeCompareList } from '$lib/compare/compareItem';
	import { getThumb } from '$lib/utility/imageThumb';

	export let products = [];
	export let onClose = () => {};

	const CUSTOM_SCOPE = 'custom';

	let catalogProducts = [];
	let catalogDepartments = [];
	let compareScope = CUSTOM_SCOPE;

	$: compareItems = Array.isArray($compare) ? $compare : [];
	$: selectedIds = new Set(compareItems.map((item) => item?.id));
	$: sourceProducts = catalogProducts.length > 0 ? catalogProducts : Array.isArray(products) ? products : [];
	$: selectedFromRouteData = sourceProducts.filter((product) => selectedIds.has(product.id));
	$: customSelectedProducts = selectedFromRouteData.length > 0 ? selectedFromRouteData : compareItems;
	const categoryKey = (value) => String(value ?? '').trim().toLowerCase();
	$: departmentOptions = (() => {
		const options = new Map();
		for (const department of catalogDepartments) {
			const key = categoryKey(department);
			if (!key || options.has(key)) continue;
			options.set(key, String(department).trim());
		}
		for (const product of sourceProducts) {
			const key = categoryKey(product?.category);
			if (!key || options.has(key)) continue;
			options.set(key, String(product.category).trim());
		}
		return [...options.entries()].sort((a, b) => a[1].localeCompare(b[1]));
	})();
	$: if (compareScope !== CUSTOM_SCOPE && !departmentOptions.some(([key]) => key === compareScope)) {
		compareScope = CUSTOM_SCOPE;
	}
	$: selectedProducts =
		compareScope === CUSTOM_SCOPE
			? customSelectedProducts
			: sourceProducts.filter((product) => categoryKey(product?.category) === compareScope);
	let hoverPreviewId = null;
	let pinnedPreviewId = null;
	let previewRect = null;
	let previewAnchorEl = null;
	let sortPopoverOpen = false;
	let helpOpen = false;
	let sortPopoverEl = null;
	let helpPopoverEl = null;
	let sortButtonEl = null;
	let helpButtonEl = null;

	const usd = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	onMount(() => {
		try {
			const parsed = JSON.parse(localStorage.getItem('compare') ?? '[]');
			$compare = sanitizeCompareList(parsed);
			localStorage.setItem('compare', JSON.stringify($compare));
		} catch {
			$compare = [];
		}

		const loadCatalog = async () => {
			try {
				const response = await fetch('/data/getAllProducts');
				if (!response.ok) return;
				const payload = await response.json();
				const productsList = payload?.things?.products;
				if (!Array.isArray(productsList)) return;
				catalogProducts = productsList;
				const departmentsList = payload?.things?.departments;
				if (Array.isArray(departmentsList)) {
					catalogDepartments = departmentsList;
				}
			} catch {
				// keep existing product data source
			}
		};
		loadCatalog();

		const handleViewportChange = () => {
			if (!previewAnchorEl || !isPreviewOpen(hoverPreviewId || pinnedPreviewId)) return;
			updatePreviewRect(previewAnchorEl);
		};
		const isWithin = (el, target) => !!el && !!target && el.contains(target);
		const handleOutsidePointer = (event) => {
			const target = event.target;
			if (sortPopoverOpen && !isWithin(sortPopoverEl, target) && !isWithin(sortButtonEl, target)) {
				sortPopoverOpen = false;
			}
			if (helpOpen && !isWithin(helpPopoverEl, target) && !isWithin(helpButtonEl, target)) {
				helpOpen = false;
			}
		};

		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('scroll', handleViewportChange, true);
		window.addEventListener('pointerdown', handleOutsidePointer, true);

		return () => {
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
			window.removeEventListener('pointerdown', handleOutsidePointer, true);
		};
	});

	const updatePreviewRect = (anchorEl) => {
		if (!anchorEl || typeof window === 'undefined') return;
		const rect = anchorEl.getBoundingClientRect();
		const scaledW = Math.round(rect.width * 2);
		const scaledH = Math.round(rect.height * 2);
		const padding = 8;
		const maxLeft = Math.max(padding, window.innerWidth - scaledW - padding);
		const maxTop = Math.max(padding, window.innerHeight - scaledH - padding);
		const left = Math.min(maxLeft, Math.max(padding, rect.left));
		const top = Math.min(maxTop, Math.max(padding, rect.top));
		previewRect = { left, top, width: scaledW, height: scaledH };
	};

	const openHoverPreview = (id, anchorEl) => {
		if (pinnedPreviewId) return;
		hoverPreviewId = id;
		previewAnchorEl = anchorEl ?? previewAnchorEl;
		updatePreviewRect(previewAnchorEl);
	};

	const closeHoverPreview = (id) => {
		if (hoverPreviewId === id) {
			hoverPreviewId = null;
			if (!pinnedPreviewId) {
				previewRect = null;
				previewAnchorEl = null;
			}
		}
	};

	const togglePinnedPreview = (id, anchorEl) => {
		pinnedPreviewId = pinnedPreviewId === id ? null : id;
		if (!pinnedPreviewId && !hoverPreviewId) {
			previewRect = null;
			previewAnchorEl = null;
			return;
		}
		previewAnchorEl = anchorEl ?? previewAnchorEl;
		updatePreviewRect(previewAnchorEl);
	};

	const isPreviewOpen = (id) => hoverPreviewId === id || pinnedPreviewId === id;
	$: activePreviewId = pinnedPreviewId || hoverPreviewId;
	$: previewProduct = selectedProducts.find((product) => product.id === activePreviewId);
	const parseNumberish = (value) => {
		if (typeof value === 'number') return Number.isFinite(value) ? value : null;
		if (typeof value === 'string') {
			const match = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
			if (!match) return null;
			const parsed = Number(match[0]);
			return Number.isFinite(parsed) ? parsed : null;
		}
		return null;
	};

	const getNumericValue = (value) => {
		const num = parseNumberish(value);
		if (num === null || num <= 0) return null;
		return num;
	};
	const median = (values) => {
		if (!Array.isArray(values) || values.length === 0) return null;
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		if (sorted.length % 2 === 0) {
			return (sorted[mid - 1] + sorted[mid]) / 2;
		}
		return sorted[mid];
	};

	const metricFields = ['price', 'shotCount', 'duration', 'height'];
	$: metricMedians = metricFields.reduce((acc, field) => {
		const values = selectedProducts
			.map((product) => getNumericValue(product?.[field]))
			.filter((value) => value !== null);
		acc[field] = median(values);
		return acc;
	}, {});

	const getSinglePrice = (product) => {
		return getNumericValue(product?.price);
	};

	const toTextList = (value) => {
		if (Array.isArray(value)) {
			return value.map((entry) => String(entry || '').trim()).filter(Boolean);
		}
		if (typeof value === 'string') {
			return value
				.split(/[|,/]/)
				.map((entry) => entry.trim())
				.filter(Boolean);
		}
		return [];
	};

	const getArrayVarietyCount = (value) => {
		const list = toTextList(value);
		const count = new Set(list.map((entry) => entry.toLowerCase())).size;
		return count > 0 ? count : null;
	};

	const getColorsList = (product) => toTextList(product?.colors);
	const getEffectsList = (product) => toTextList(product?.effects);

	const priorityMetrics = [
		'singlePrice',
		'colorVariety',
		'effectsVariety',
		'shotCount',
		'duration',
		'height'
	];
	const presetOrders = {
		balanced: ['singlePrice', 'colorVariety', 'effectsVariety', 'shotCount', 'duration', 'height'],
		value: ['singlePrice', 'duration', 'shotCount', 'height', 'colorVariety', 'effectsVariety'],
		performance: ['shotCount', 'duration', 'height', 'effectsVariety', 'colorVariety', 'singlePrice']
	};
	const presetLabels = {
		balanced: 'Balanced',
		value: 'Value',
		performance: 'Performance'
	};
	let appliedPriorityOrder = [...presetOrders.balanced];
	let draftPriorityOrder = [...appliedPriorityOrder];

	const applyPreset = (name) => {
		const preset = presetOrders[name];
		if (!preset) return;
		draftPriorityOrder = [...preset];
	};

	const useCustomPriority = () => {
		draftPriorityOrder = [];
	};

	const togglePriorityMetric = (metric) => {
		const idx = draftPriorityOrder.indexOf(metric);
		if (idx !== -1) {
			draftPriorityOrder = draftPriorityOrder.filter((key) => key !== metric);
			return;
		}
		draftPriorityOrder = [...draftPriorityOrder, metric];
	};

	$: orderedPriorityMetrics = [
		...draftPriorityOrder,
		...priorityMetrics.filter((metric) => !draftPriorityOrder.includes(metric))
	];

	const rankForMetric = (metric, order = draftPriorityOrder) => {
		const idx = order.indexOf(metric);
		return idx === -1 ? null : idx + 1;
	};

	const metricLabel = (metric) => {
		if (metric === 'singlePrice') return 'Single Price';
		if (metric === 'colorVariety') return 'Color Variety';
		if (metric === 'effectsVariety') return 'Effects Variety';
		if (metric === 'shotCount') return 'Shots';
		if (metric === 'duration') return 'Duration';
		if (metric === 'height') return 'Height';
		return metric;
	};

	const isSameOrder = (a, b) =>
		Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => item === b[i]);

	$: activeDraftPreset =
		Object.entries(presetOrders).find(([, order]) => isSameOrder(order, draftPriorityOrder))?.[0] || 'custom';

	const applyPrioritySorting = () => {
		if (!draftPriorityOrder.length) return;
		appliedPriorityOrder = [...draftPriorityOrder];
		sortPopoverOpen = false;
	};

	$: hasDraftPriorityChanges = !isSameOrder(draftPriorityOrder, appliedPriorityOrder);

	$: singlePriceMedian = median(
		selectedProducts.map((product) => getSinglePrice(product)).filter((value) => value !== null)
	);

	const metricValueForPriority = (product, metric) => {
		if (metric === 'singlePrice') return getSinglePrice(product);
		if (metric === 'colorVariety') return getArrayVarietyCount(product?.colors);
		if (metric === 'effectsVariety') return getArrayVarietyCount(product?.effects);
		return getNumericValue(product?.[metric]);
	};

	$: priorityRanges = priorityMetrics.reduce((acc, metric) => {
		const values = selectedProducts
			.map((product) => metricValueForPriority(product, metric))
			.filter((value) => value !== null);
		if (values.length === 0) {
			acc[metric] = null;
			return acc;
		}
		acc[metric] = { min: Math.min(...values), max: Math.max(...values) };
		return acc;
	}, {});

	const normalizedMetricScore = (value, range, isLowerBetter = false) => {
		if (value === null || !range) return null;
		if (range.max === range.min) return 0.5;
		const normalized = (value - range.min) / (range.max - range.min);
		return isLowerBetter ? 1 - normalized : normalized;
	};

	let sortedSelectedProducts = [];

	const scoreProductByPriority = (product, order, ranges) => {
		if (!order.length) return Number.NEGATIVE_INFINITY;
		let weighted = 0;
		let totalWeight = 0;
		const length = order.length;

		for (let i = 0; i < length; i += 1) {
			const metric = order[i];
			const value = metricValueForPriority(product, metric);
			const range = ranges[metric];
			const normalized = normalizedMetricScore(value, range, metric === 'singlePrice');
			if (normalized === null) continue;
			const weight = length - i;
			weighted += normalized * weight;
			totalWeight += weight;
		}

		if (totalWeight === 0) return Number.NEGATIVE_INFINITY;
		return weighted / totalWeight;
	};

	$: {
		const activeOrder = [...appliedPriorityOrder];
		const activeRanges = priorityRanges;
		sortedSelectedProducts = selectedProducts
			.map((product, index) => ({
				product,
				index,
				score: scoreProductByPriority(product, activeOrder, activeRanges)
			}))
			.sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score;
				return a.index - b.index;
			})
			.map((entry) => entry.product);
	}

	const diffMeta = (value, baseline) => {
		const number = getNumericValue(value);
		if (number === null || !Number.isFinite(baseline) || baseline <= 0) return null;
		const pct = ((number - baseline) / baseline) * 100;
		if (Math.abs(pct) < 0.1) return { arrow: '–', pctText: '0.0%', tone: 'neutral' };
		return {
			arrow: pct > 0 ? '▲' : '▼',
			pctText: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`,
			tone: pct > 0 ? 'up' : 'down'
		};
	};

	const diffLabel = (value, baseline) => {
		const diff = diffMeta(value, baseline);
		return diff ? `${diff.arrow} ${diff.pctText}` : '–';
	};

	const diffTone = (value, baseline) => diffMeta(value, baseline)?.tone || 'neutral';

	const formatNumber = (value) => {
		const num = getNumericValue(value);
		if (num === null) return 'N/A';
		return String(num);
	};

	const resetCompare = () => {
		$compare = [];
		hoverPreviewId = null;
		pinnedPreviewId = null;
		previewRect = null;
		previewAnchorEl = null;
		if (typeof window !== 'undefined') {
			localStorage.setItem('compare', '[]');
		}
	};

	const toggleSortPopover = () => {
		if (!sortPopoverOpen) {
			draftPriorityOrder = [...appliedPriorityOrder];
		}
		helpOpen = false;
		sortPopoverOpen = !sortPopoverOpen;
	};

	const toggleHelpPanel = () => {
		sortPopoverOpen = false;
		helpOpen = !helpOpen;
	};
</script>

<div class="modal-page">
	<div class="modal-frame">
		<div class="modal-backdrop" on:click={onClose}></div>
		<div class="modal compare-modal" role="dialog" aria-modal="true" aria-label="Item compare">
			<div class="modal-header">
				<h2>Item Compare</h2>
				<div class="header-actions">
					<div class="header-group header-group-scope">
						<label class="scope-control">
							<span>Scope</span>
							<select bind:value={compareScope} class="scope-select">
								<option value={CUSTOM_SCOPE}>Custom</option>
								{#each departmentOptions as [key, label]}
									<option value={key}>{label}</option>
								{/each}
							</select>
						</label>
					</div>
					<div class="header-group header-group-sort">
						<button
							bind:this={sortButtonEl}
							class="modal-sort"
							type="button"
							on:click={toggleSortPopover}
						>
							Set Sort Order
						</button>
					</div>
					<div class="header-group header-group-utility">
						<button
							bind:this={helpButtonEl}
							class="modal-help"
							type="button"
							on:click={toggleHelpPanel}
						>
							How to Use
						</button>
						<button class="modal-reset" type="button" on:click={resetCompare}>Reset</button>
					</div>
					<button class="modal-close" type="button" on:click={onClose}>×</button>
				</div>
				{#if sortPopoverOpen}
					<div class="sort-popover" bind:this={sortPopoverEl}>
						<button
							type="button"
							class="popover-close"
							aria-label="Close sort options"
							on:click={() => (sortPopoverOpen = false)}
						>
							×
						</button>
						<div class="sort-row">
							<span class="sort-label">Preset:</span>
							<div class="preset-list">
								{#each Object.keys(presetOrders) as preset}
									<button
										type="button"
										class="preset-chip"
										class:active={activeDraftPreset === preset}
										on:click={() => applyPreset(preset)}
									>
										{presetLabels[preset]}
									</button>
								{/each}
								<button
									type="button"
									class="preset-chip"
									class:active={activeDraftPreset === 'custom'}
									on:click={useCustomPriority}
								>
									Custom
								</button>
							</div>
						</div>
						<div class="sort-row">
							<span class="sort-label">Priority:</span>
							<div class="metric-list">
								{#each orderedPriorityMetrics as metric (metric)}
									<button
										type="button"
										class="metric-chip"
										animate:flip={{ duration: 180, easing: cubicOut }}
										class:active={rankForMetric(metric, draftPriorityOrder) !== null}
										on:click={() => togglePriorityMetric(metric)}
									>
										<span class="metric-rank-badge">
											{#if rankForMetric(metric, draftPriorityOrder) !== null}
												#{rankForMetric(metric, draftPriorityOrder)}
											{:else}
												+
											{/if}
										</span>
										<span class="metric-chip-label">{metricLabel(metric)}</span>
									</button>
								{/each}
							</div>
						</div>
						<div class="sort-row compact">
							<span class="sort-label">Current:</span>
							<div class="order-line">
								{#if draftPriorityOrder.length === 0}
									<span class="order-empty">No priorities selected</span>
								{:else}
									<div class="order-pill-list">
										{#each draftPriorityOrder as metric, idx (metric)}
											<span class="order-pill">
												<span class="order-pill-badge">#{idx + 1}</span>
												<span class="order-pill-label">{metricLabel(metric)}</span>
											</span>
										{/each}
									</div>
								{/if}
							</div>
						</div>
						<div class="sort-row actions">
							<button
								type="button"
								class="apply-priority"
								on:click={applyPrioritySorting}
								disabled={draftPriorityOrder.length === 0 || !hasDraftPriorityChanges}
							>
								Apply Priority Sorting
							</button>
						</div>
					</div>
				{/if}
				{#if helpOpen}
					<div
						class="help-popover"
						bind:this={helpPopoverEl}
						transition:fade={{ duration: 140, easing: cubicOut }}
					>
						<button
							type="button"
							class="popover-close"
							aria-label="Close help"
							on:click={() => (helpOpen = false)}
						>
							×
						</button>
						<h3>Compare Tool: How to Use</h3>
						<p class="help-deep-link">
							Need the full breakdown? <a href="/product/compare-help" target="_blank" rel="noopener noreferrer">Open detailed instructions</a>.
						</p>
						<div class="help-section">
							<h4>1. Pick What To Compare</h4>
							<p>
								Use <strong>Scope</strong> to choose which items appear in the table.
							</p>
							<ul>
								<li><strong>Custom</strong>: only items you manually added.</li>
								<li><strong>Department name</strong>: all items in that department.</li>
							</ul>
						</div>
						<div class="help-section">
							<h4>2. Choose What Matters Most</h4>
							<p>Click <strong>Set Sort Order</strong> to choose how the list should rank items.</p>
							<ul>
								<li>Use a preset (<strong>Balanced</strong>, <strong>Value</strong>, <strong>Performance</strong>) or choose <strong>Custom</strong>.</li>
								<li>Pick your priority order (first = most important).</li>
								<li>Click <strong>Apply Priority Sorting</strong> to reorder the table.</li>
							</ul>
						</div>
						<div class="help-section">
							<h4>3. Read the Table</h4>
							<ul>
								<li>
									The <strong>item card</strong> shows image, name, department, and deal price.
								</li>
								<li>
									Numbers include a small indicator showing whether that item is above or below the middle value.
								</li>
								<li>
									Header badges like <strong>#1</strong>, <strong>#2</strong> show your current priority order.
								</li>
							</ul>
						</div>
						<div class="help-section">
							<h4>4. Preview and Reset</h4>
							<ul>
								<li>
									Hover or click an image to open a larger preview.
								</li>
								<li>
									Use <strong>Reset</strong> to clear your custom compare list and start over.
								</li>
							</ul>
						</div>
					</div>
				{/if}
			</div>
			<div class="modal-body">
				<Container>
					{#if sortedSelectedProducts.length === 0}
						<p class="empty-state">
							{#if compareScope === CUSTOM_SCOPE}
								No compare items selected yet. Add items from the <a href="/product">Product page</a>.
							{:else}
								No products found for this department.
							{/if}
						</p>
					{:else}
						<div class="compare-table-wrap">
							<table class="compare-table">
								<thead>
									<tr>
										<th scope="col">Item</th>
										<th scope="col">Single Price {#if rankForMetric('singlePrice', appliedPriorityOrder)}<span class="priority-badge">#{rankForMetric('singlePrice', appliedPriorityOrder)}</span>{/if}</th>
										<th scope="col">Colors {#if rankForMetric('colorVariety', appliedPriorityOrder)}<span class="priority-badge">#{rankForMetric('colorVariety', appliedPriorityOrder)}</span>{/if}</th>
										<th scope="col">Effects {#if rankForMetric('effectsVariety', appliedPriorityOrder)}<span class="priority-badge">#{rankForMetric('effectsVariety', appliedPriorityOrder)}</span>{/if}</th>
										<th scope="col">Shots {#if rankForMetric('shotCount', appliedPriorityOrder)}<span class="priority-badge">#{rankForMetric('shotCount', appliedPriorityOrder)}</span>{/if}</th>
										<th scope="col">Duration {#if rankForMetric('duration', appliedPriorityOrder)}<span class="priority-badge">#{rankForMetric('duration', appliedPriorityOrder)}</span>{/if}</th>
										<th scope="col">Height {#if rankForMetric('height', appliedPriorityOrder)}<span class="priority-badge">#{rankForMetric('height', appliedPriorityOrder)}</span>{/if}</th>
									</tr>
								</thead>
								<tbody>
									{#each sortedSelectedProducts as product (product.id)}
										<tr animate:flip={{ duration: 220, easing: cubicOut }}>
											<td class="item-cell">
												<div class="item-stage">
													<button
														type="button"
														class="item-card"
														aria-label={`Preview ${product.title || 'item'}`}
														aria-expanded={isPreviewOpen(product.id)}
														on:mouseenter={(e) => openHoverPreview(product.id, e.currentTarget)}
														on:mouseleave={() => closeHoverPreview(product.id)}
														on:focus={(e) => openHoverPreview(product.id, e.currentTarget)}
														on:blur={() => closeHoverPreview(product.id)}
														on:click={(e) => togglePinnedPreview(product.id, e.currentTarget)}
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
													<div class="price-strip {product.deal === '3 FOR' ? 'deal-three' : 'deal-two'}">
														<span class="deal-tag">{product.deal || 'Deal'}</span>
														<span class="deal-price">{usd.format(product.price || 0)}</span>
													</div>
												</div>
											</td>
											<td class="metric-cell">
												<div class="metric-value">
													{#if getSinglePrice(product) !== null}
														{usd.format(getSinglePrice(product))}
													{:else}
														N/A
													{/if}
												</div>
												<div class="metric-diff {diffTone(getSinglePrice(product), singlePriceMedian)}">
													{diffLabel(getSinglePrice(product), singlePriceMedian)}
												</div>
											</td>
											<td class="colors-cell">
												{#if getColorsList(product).length > 0}
													<ColorDots colors={getColorsList(product)} maxDots={6} dotSize={14} burstInterval={200} />
												{:else}
													<span class="metric-na">N/A</span>
												{/if}
											</td>
											<td class="effects-cell">
												{#if getEffectsList(product).length > 0}
													<div class="effects">
														{#each getEffectsList(product).slice(0, 4) as effect}
															<span class="effect-chip">{effect}</span>
														{/each}
													</div>
												{:else}
													<span class="effect-chip">No effects listed</span>
												{/if}
											</td>
											<td class="metric-cell">
												<div class="metric-value">{formatNumber(product.shotCount)}</div>
												<div class="metric-diff {diffTone(product.shotCount, metricMedians.shotCount)}">
													{diffLabel(product.shotCount, metricMedians.shotCount)}
												</div>
											</td>
											<td class="metric-cell">
												<div class="metric-value">{formatNumber(product.duration)}</div>
												<div class="metric-diff {diffTone(product.duration, metricMedians.duration)}">
													{diffLabel(product.duration, metricMedians.duration)}
												</div>
											</td>
											<td class="metric-cell">
												<div class="metric-value">{formatNumber(product.height)}</div>
												<div class="metric-diff {diffTone(product.height, metricMedians.height)}">
													{diffLabel(product.height, metricMedians.height)}
												</div>
											</td>
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
	{#if previewProduct && previewRect}
		<div
			class="preview-overlay"
			style={`left:${previewRect.left}px;top:${previewRect.top}px;width:${previewRect.width}px;height:${previewRect.height}px;`}
			transition:fade={{ duration: 120, easing: cubicOut }}
		>
			<div class="preview-card" transition:scale={{ duration: 160, start: 0.94, easing: cubicOut }}>
				<img
					class="preview-image"
					loading="lazy"
					src={getThumb(previewProduct.imageThumb)}
					alt={previewProduct.title ? `${previewProduct.title} enlarged preview` : 'Item enlarged preview'}
				/>
				<div class="item-overlay">
					<div class="name-cell">{previewProduct.title || 'Unnamed item'}</div>
					<div class="category-cell">{previewProduct.category || 'Uncategorized'}</div>
				</div>
				<div class="price-strip {previewProduct.deal === '3 FOR' ? 'deal-three' : 'deal-two'}">
					<span class="deal-tag">{previewProduct.deal || 'Deal'}</span>
					<span class="deal-price">{usd.format(previewProduct.price || 0)}</span>
				</div>
			</div>
		</div>
	{/if}
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
	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}
	.header-group {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.header-group + .header-group {
		padding-left: 0.5rem;
		border-left: 1px solid rgba(255, 255, 255, 0.28);
	}
	.header-group-utility {
		gap: 0.35rem;
	}
	.scope-control {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.scope-select {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		padding: 0.28rem 0.42rem;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.scope-select:focus-visible {
		outline: 2px solid var(--yellow-accent);
		outline-offset: 1px;
	}
	.modal-sort {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		padding: 0.35rem 0.55rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.modal-help {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		padding: 0.35rem 0.55rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.modal-reset {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		padding: 0.35rem 0.55rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.sort-popover {
		position: fixed;
		right: max(1rem, calc((100vw - min(96vw, 1480px)) / 2 + 1rem));
		top: calc(var(--nav-height) + 3.4rem);
		width: min(92vw, 460px);
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		padding: 1.9rem 0.65rem 0.55rem;
		z-index: 8;
	}
	.popover-close {
		position: absolute;
		top: 0.35rem;
		right: 0.35rem;
		width: 1.5rem;
		height: 1.5rem;
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.help-popover {
		position: fixed;
		right: max(1rem, calc((100vw - min(96vw, 1480px)) / 2 + 1rem));
		top: calc(var(--nav-height) + 3.4rem);
		width: min(92vw, 560px);
		max-height: min(68vh, 620px);
		overflow: auto;
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		padding: 2rem 0.9rem 0.8rem;
		z-index: 8;
	}
	.help-popover h3 {
		margin: 0 0 0.45rem 0;
		text-transform: uppercase;
		font-size: 0.95rem;
		letter-spacing: 0.04em;
	}
	.help-deep-link {
		margin: 0 0 0.45rem 0;
		font-size: 0.78rem;
		line-height: 1.35;
	}
	.help-deep-link a {
		font-weight: 700;
		color: var(--grey);
	}
	.help-section {
		padding: 0.45rem 0;
		border-top: 1px solid var(--grey-light);
	}
	.help-section:first-of-type {
		border-top: none;
		padding-top: 0.2rem;
	}
	.help-section h4 {
		margin: 0 0 0.2rem 0;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.help-section p {
		margin: 0.2rem 0 0.35rem 0;
		font-size: 0.78rem;
		line-height: 1.35;
	}
	.help-section ul {
		margin: 0;
		padding-left: 1rem;
	}
	.help-section li {
		margin: 0.22rem 0;
		font-size: 0.75rem;
		line-height: 1.35;
	}
	.sort-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		margin-bottom: 0.45rem;
	}
	.sort-row:last-child {
		margin-bottom: 0;
	}
	.sort-row.compact {
		margin-top: 0.15rem;
	}
	.sort-row.actions {
		justify-content: flex-end;
		margin-top: 0.25rem;
	}
	.sort-label {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		min-width: 68px;
		padding-top: 0.2rem;
	}
	.preset-list,
	.metric-list {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.35rem;
	}
	.order-line {
		font-size: 0.72rem;
		line-height: 1.2;
		opacity: 0.95;
		padding-top: 0.2rem;
		width: 100%;
	}
	.order-empty {
		opacity: 0.75;
		font-style: italic;
	}
	.order-pill-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.order-pill {
		display: inline-flex;
		align-items: center;
		border: 1px solid var(--grey);
		background: var(--off-white);
		color: var(--grey);
	}
	.order-pill-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.55rem;
		padding: 0.18rem 0.32rem;
		background: var(--yellow-accent);
		color: var(--grey);
		font-weight: 700;
		border-right: 1px solid var(--grey);
	}
	.order-pill-label {
		padding: 0.18rem 0.45rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 700;
		font-size: 0.68rem;
	}
	.preset-chip,
	.metric-chip {
		border: 1px solid var(--grey);
		background: var(--off-white);
		color: var(--grey);
		padding: 0.2rem 0.42rem;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}
	.metric-chip {
		width: 100%;
		text-align: left;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0;
	}
	.metric-rank-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.7rem;
		padding: 0.28rem 0.34rem;
		border-right: 1px solid var(--grey);
		background: var(--off-white);
		color: var(--grey-accent);
		font-weight: 700;
		font-size: 0.66rem;
		line-height: 1;
	}
	.metric-chip-label {
		display: inline-flex;
		align-items: center;
		padding-right: 0.42rem;
		font-weight: 700;
	}
	.metric-chip.active .metric-rank-badge {
		background: var(--yellow-accent);
		color: var(--grey);
		border-right-color: var(--grey);
	}
	.preset-chip.active,
	.metric-chip.active {
		background: var(--grey);
		color: var(--white);
		border-color: var(--grey);
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.apply-priority {
		border: 1px solid var(--grey);
		background: var(--grey);
		color: var(--white);
		padding: 0.3rem 0.6rem;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.apply-priority:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: none;
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
	@media (max-width: 980px) {
		.header-actions {
			gap: 0.35rem;
		}
		.header-group + .header-group {
			border-left: none;
			padding-left: 0;
		}
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
		min-width: 760px;
		border-collapse: collapse;
		table-layout: fixed;
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
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.priority-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 0.3rem;
		padding: 0.05rem 0.32rem;
		border: 1px solid var(--yellow-accent);
		background: var(--yellow-accent);
		color: var(--grey);
		font-size: 0.64rem;
		line-height: 1;
	}
	.compare-table tbody tr:nth-child(even) {
		background: rgba(0, 0, 0, 0.03);
	}
	.compare-table tbody tr:last-child td {
		border-bottom: 0;
	}
	.item-cell {
		min-width: 150px;
		width: 160px;
	}
	.colors-cell {
		min-width: 180px;
	}
	.effects-cell {
		min-width: 180px;
	}
	.effects {
		display: inline-flex;
		gap: 0.4em;
		flex-wrap: wrap;
	}
	.effect-chip {
		font-size: 0.65em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: transparent;
		color: var(--grey);
		padding: 0.15em 0.4em;
		border-radius: 999px;
		border: 1px solid var(--grey);
	}
	.metric-cell {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.metric-value {
		font-weight: 700;
	}
	.metric-na {
		color: var(--grey-accent);
		font-weight: 600;
	}
	.item-stage {
		position: relative;
		--thumb-h: 96px;
		width: 118px;
		height: calc(var(--thumb-h) + 22px);
		box-shadow: 5px 5px 0 var(--yellow-accent);
	}
	.item-card {
		position: relative;
		width: 118px;
		height: var(--thumb-h);
		border: 1px solid var(--grey);
		padding: 0;
		background: var(--off-white);
		overflow: hidden;
		cursor: pointer;
		display: block;
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
	.price-strip {
		position: absolute;
		left: 0;
		right: 0;
		top: var(--thumb-h);
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.25rem;
		padding: 0 0.4rem;
		box-sizing: border-box;
		border: 1px solid #000;
	}
	.deal-two {
		background: var(--red);
		color: var(--white);
	}
	.deal-three {
		background: var(--yellow);
		color: var(--grey);
	}
	.deal-tag {
		font-size: 0.62rem;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
		white-space: nowrap;
	}
	.deal-price {
		font-size: 0.7rem;
		line-height: 1.1;
		font-weight: 700;
		font-family: inherit;
		white-space: nowrap;
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
	.metric-diff {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.01em;
		white-space: nowrap;
	}
	.metric-diff.up {
		color: #1e8f3e;
	}
	.metric-diff.down {
		color: #b71c1c;
	}
	.metric-diff.neutral {
		color: var(--grey-accent);
	}
	.preview-overlay {
		position: fixed;
		z-index: 1400;
		pointer-events: none;
	}
	.preview-card {
		position: absolute;
		inset: 0;
		box-shadow: 8px 8px 0 var(--yellow-accent);
	}
	.preview-image {
		position: absolute;
		inset: 0 0 22px 0;
		width: 100%;
		height: calc(100% - 22px);
		object-fit: cover;
		border: 1px solid var(--grey);
		background: var(--off-white);
		display: block;
	}
	.preview-card .item-overlay {
		bottom: 22px;
	}
	.preview-card .price-strip {
		top: auto;
		bottom: 0;
		height: 22px;
	}
	@media (max-width: 700px) {
		.modal-body {
			padding: 1rem 0.75rem;
		}
		.compare-table th,
		.compare-table td {
			padding: 0.55rem;
		}
		.colors-cell :global(.color-dots) {
			padding: 0.35em 0.45em;
			gap: 0.3em;
		}
		.item-stage,
		.item-card {
			width: 110px;
		}
		.item-stage {
			--thumb-h: 88px;
		}
		.item-card {
			height: var(--thumb-h);
		}
	}
</style>
