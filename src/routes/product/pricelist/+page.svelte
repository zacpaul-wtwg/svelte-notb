<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import ColorDots from '$lib/components/ColorDots.svelte';

	export const verticalize = function (array) {
		return array.join(', ');
	};

	$: description = false;
	$: effects = false;
	$: colors = false;
	$: colorDots = false;
	$: sounds = false;
	$: printMode = 'compact';
	$: dataColumnCount = 3 + (effects ? 1 : 0) + (colors ? 1 : 0) + (sounds ? 1 : 0);
	let togglesOpen = false;
	let togglesPopoverEl;
	let togglesButtonEl;
	let helpOpen = false;
	let helpPopoverEl;
	let helpButtonEl;

	export let data;
	$: things = data?.things ?? { products: [], departments: [] };
	$: departments = [...(things.departments ?? [])].sort();

	$: departmentFilter = 'all departments';
	$: products = things.products ?? [];
	$: filteredProducts = products;
	$: sortedProducts = filteredProducts
		.filter((x) => x.category === departmentFilter || departmentFilter === 'all departments')
		.sort(
			(a, b) =>
				(a.category ?? '').localeCompare(b.category ?? '') ||
				(a.title ?? '').localeCompare(b.title ?? '') ||
				String(a.id ?? '').localeCompare(String(b.id ?? ''))
		);

	onMount(() => {
		const isWithin = (el, target) => !!el && !!target && el.contains(target);
		const handleOutsidePointer = (event) => {
			const target = event.target;
			if (togglesOpen && !isWithin(togglesPopoverEl, target) && !isWithin(togglesButtonEl, target)) {
				togglesOpen = false;
			}
			if (helpOpen && !isWithin(helpPopoverEl, target) && !isWithin(helpButtonEl, target)) {
				helpOpen = false;
			}
		};
		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				togglesOpen = false;
				helpOpen = false;
			}
		};
		window.addEventListener('pointerdown', handleOutsidePointer, true);
		window.addEventListener('keydown', handleEscape);
		return () => {
			window.removeEventListener('pointerdown', handleOutsidePointer, true);
			window.removeEventListener('keydown', handleEscape);
		};
	});

	const setPrintMode = (mode) => {
		if (mode === 'detailed') {
			const noColumnTogglesEnabled = !description && !effects && !colors && !sounds && !colorDots;
			if (noColumnTogglesEnabled) {
				description = true;
				effects = true;
				colors = true;
				colorDots = true;
				sounds = true;
			}
		}
		if (mode === 'compact') {
			togglesOpen = false;
		}
		printMode = mode;
	};
</script>

<div class="modal-page">
	<div class="modal-frame">
		<div class="modal-backdrop" on:click={() => goto('/product')}></div>
		<div class="modal pricelist-modal" role="dialog" aria-modal="true" aria-label="Price List">
			<div class="modal-header">
				<div class="modal-header-main">
					<h2>Price List</h2>
					<button class="modal-close" type="button" on:click={() => goto('/product')}>×</button>
				</div>
				<hr class="modal-header-rule noprint" />
				<div class="controls-header noprint">
					<button class="print-button" type="button" on:click={() => window.print()}>Print</button>
					<span class="controls-separator" aria-hidden="true"></span>

					<div class="control-group department-filter-wrap">
						<label class="department-filter-label" for="department-filter">Department</label>
						<select
							name="department-filter"
							id="department-filter"
							bind:value={departmentFilter}
							class="department-filter-select"
						>
							<option value="all departments" default>ALL DEPARTMENTS</option>
							{#each departments as department}
								<option value={department}>{department}</option>
							{/each}
						</select>
					</div>

					<div class="control-group print-mode-group" role="group" aria-label="Print mode">
						<span class="print-mode-label">Print</span>
						<div class="print-mode-toggle">
							<button
								type="button"
								class:active={printMode === 'compact'}
								on:click={() => setPrintMode('compact')}
							>
								Compact
							</button>
							<button
								type="button"
								class:active={printMode === 'detailed'}
								on:click={() => setPrintMode('detailed')}
							>
								Detailed
							</button>
						</div>
					</div>
					{#if printMode === 'detailed'}
						<div class="control-group toggles-control">
							<button
								class="columns-button"
								type="button"
								bind:this={togglesButtonEl}
								aria-expanded={togglesOpen}
								aria-haspopup="dialog"
								on:click={() => (togglesOpen = !togglesOpen)}
							>
								Columns
							</button>
							{#if togglesOpen}
								<div
									class="column-popover"
									bind:this={togglesPopoverEl}
									role="dialog"
									aria-label="Column toggles"
								>
									<button
										class="popover-close"
										type="button"
										aria-label="Close column toggles"
										on:click={() => (togglesOpen = false)}
									>
										×
									</button>
									<label class="toggle-row">
										<span class="toggle-label">Description</span>
										<span class="toggle">
											<input type="checkbox" bind:checked={description} />
											<span class="track"></span>
											<span class="thumb"></span>
										</span>
									</label>
									<label class="toggle-row">
										<span class="toggle-label">Effects</span>
										<span class="toggle">
											<input type="checkbox" bind:checked={effects} />
											<span class="track"></span>
											<span class="thumb"></span>
										</span>
									</label>
									<label class="toggle-row">
										<span class="toggle-label">Colors</span>
										<span class="toggle">
											<input type="checkbox" bind:checked={colors} />
											<span class="track"></span>
											<span class="thumb"></span>
										</span>
									</label>
									<label class="toggle-row">
										<span class="toggle-label">Sounds</span>
										<span class="toggle">
											<input type="checkbox" bind:checked={sounds} />
											<span class="track"></span>
											<span class="thumb"></span>
										</span>
									</label>
								</div>
							{/if}
						</div>
						{#if colors}
							<div class="control-group color-dots-control">
								<span class="header-toggle-label">Color Dots</span>
								<button
									class="toggle-ghost-button"
									type="button"
									aria-label="Toggle color dots"
									aria-pressed={colorDots}
									on:click={() => (colorDots = !colorDots)}
								>
									<span class="toggle visual-toggle" class:checked={colorDots}>
										<span class="track"></span>
										<span class="thumb"></span>
									</span>
								</button>
							</div>
						{/if}
					{/if}
					<div class="control-group help-control">
						<button
							class="help-button"
							type="button"
							bind:this={helpButtonEl}
							aria-expanded={helpOpen}
							aria-haspopup="dialog"
							on:click={() => (helpOpen = !helpOpen)}
						>
							How to Use
						</button>
						{#if helpOpen}
							<div class="help-popover" bind:this={helpPopoverEl} role="dialog" aria-label="How to use price list">
								<button
									class="popover-close"
									type="button"
									aria-label="Close how to use"
									on:click={() => (helpOpen = false)}
								>
									×
								</button>
								<h3>How to Use</h3>
								<ul>
									<li>Choose <strong>Compact</strong> for a shorter print list.</li>
									<li>Choose <strong>Detailed</strong> to enable column options.</li>
									<li>Use <strong>Columns</strong> to toggle optional fields on or off.</li>
									<li>Enable <strong>Color Dots</strong> when Colors are enabled to print dot pills.</li>
									<li>Use <strong>Department</strong> to limit the list before printing.</li>
									<li>Click <strong>Print</strong> when your layout looks right.</li>
								</ul>
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="modal-body">
				<Container>
					<section class="page-stack pricelist-page">
						<section class="print-sheet">
							<img class="print-logo" src="/logo_large_inverse.png" alt="North of the Border Logo" />
							<div class="print-meta">
								<div class="print-disclaimer-wrap">
									<p class="print-disclaimer-label">Notice</p>
									<p class="print-disclaimer">
										This price list reflects our current in-store data as of
										<strong>{new Date().toDateString()}</strong>. Availability and pricing may change without
										notice. Final pricing is confirmed at checkout.
									</p>
								</div>
								<div class="print-meta-right">
									<h2 class="doprint">{departmentFilter}</h2>
									<p class="print-doc-title">North of the Border Fireworks Pricelist</p>
									<p class="print-as-of">As of: {new Date().toLocaleString()}</p>
								</div>
							</div>
							<table
								id="tg-1oY8l"
								class="tg table-sort remember-sort"
								class:print-compact={printMode === 'compact'}
								class:color-dots-enabled={colorDots}
							>
								<thead>
									<tr>
										<th class="tg-0lax col-id disable-sort">ID</th>
										<th class="tg-0lax col-title">Title</th>
										<th class="tg-0lax col-pricing">Pricing</th>
										{#if effects}
											<th class="tg-0lax col-optional col-effects">Effects</th>
										{/if}
										{#if colors}
											<th class="tg-0lax col-optional col-colors">Colors</th>
										{/if}
										{#if sounds}
											<th class="tg-0lax col-optional col-sounds">Sounds</th>
										{/if}
									</tr>
								</thead>
								<tbody>
									{#each sortedProducts as product, i}
										<tr
											class:item-even={i % 2 === 0}
											class:item-odd={i % 2 !== 0}
											class:has-description={description}
										>
											<td class="tg-0lax col-id">{product.id}</td>
											<td class="tg-0lax col-title">
												<div class="title-main">{product.title}</div>
												<span class="dept-chip">{product.category}</span>
											</td>
											<td class="tg-0lax col-pricing">
												<span class="deal-inline">{product.deal}</span>
												<span class="price-inline">${product.price.toFixed(2)}</span>
											</td>
											{#if effects}
												<td class="tg-0lax col-optional col-effects">
													<div class="list-inline">
														{#each product.effects as effect}
															<span class="list-chip">{effect}</span>
														{/each}
													</div>
												</td>
											{/if}
											{#if colors}
												<td class="tg-0lax col-optional col-colors">
													{#if colorDots}
														<div class="color-pill-mode">
															<ColorDots
																colors={product.colors ?? []}
																maxDots={8}
																dotSize={12}
																burstInterval={220}
																adaptiveRadiusOnWrap={true}
																wrappedRadius={8}
															/>
														</div>
														<div class="list-inline color-print-fallback">
															{#each product.colors as color}
																<span class="list-chip">{color}</span>
															{/each}
														</div>
													{:else}
														<div class="list-inline">
															{#each product.colors as color}
																<span class="list-chip">{color}</span>
															{/each}
														</div>
													{/if}
												</td>
											{/if}
											{#if sounds}
												<td class="tg-0lax col-optional col-sounds">
													<div class="list-inline">
														{#each product.sounds as sound}
															<span class="list-chip">{sound}</span>
														{/each}
													</div>
												</td>
											{/if}
										</tr>
										{#if description}
											<tr
												class="desc-row col-optional col-description"
												class:item-even={i % 2 === 0}
												class:item-odd={i % 2 !== 0}
											>
												<td class="tg-0lax" colspan={printMode === 'compact' ? 3 : dataColumnCount}>
													<span class="desc-content">
														<span class="desc-label">Description:</span>
														<span class="desc-value">{product.description}</span>
													</span>
												</td>
											</tr>
										{/if}
									{/each}
								</tbody>
							</table>
						</section>
					</section>
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
		width: min(96vw, 1300px);
		max-height: calc(100vh - var(--nav-height) - 5em);
		overflow: auto;
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 10px 10px 0 var(--yellow-accent);
		z-index: 2;
		padding: 0;
	}
	.modal-header {
		position: sticky;
		top: 0;
		background: #000;
		color: var(--white);
		z-index: 5;
		padding: 0.65rem 1rem 0.7rem;
		border-top: 2px solid var(--white);
		border-left: 2px solid var(--white);
		border-right: 2px solid var(--white);
	}
	.modal-header-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.modal-header h2 {
		margin: 0;
		text-transform: uppercase;
		font-size: 1.15rem;
		line-height: 1;
	}
	.modal-header-rule {
		border: 0;
		border-top: 1px solid rgba(255, 255, 255, 0.38);
		margin: 0.5rem 0 0.55rem;
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
		padding: 1.25em;
	}
	:global(.main .title-container) {
		display: none;
	}
	.pricelist-page {
		padding-top: 0.25rem;
	}
	.tg {
		border-collapse: collapse;
		border-spacing: 0;
		width: 100%;
		table-layout: auto;
	}
	.tg td {
		border: 0;
		border-bottom: 1px solid #c7c7c7;
		font-family: Arial, sans-serif;
		font-size: 13px;
		overflow: hidden;
		padding: 8px 7px;
		word-break: normal;
		line-height: 1.35;
		position: relative;
	}
	.tg th {
		border: 0;
		border-bottom: 2px solid #1f1f1f;
		font-family: Arial, sans-serif;
		font-size: 12px;
		font-weight: normal;
		overflow: hidden;
		padding: 8px 7px;
		word-break: normal;
		position: relative;
	}
	.tg td:not(:last-child)::after,
	.tg th:not(:last-child)::after {
		content: '';
		position: absolute;
		right: 0;
		top: 22%;
		height: 56%;
		width: 1px;
		background: #c9c9c9;
	}
	.tg .tg-0lax {
		text-align: left;
		vertical-align: top;
	}
	.print-sheet {
		background: #fff;
		border: 1px solid #111;
		box-shadow: 6px 6px 0 #d9d9d9;
		padding: 0.8rem;
	}
	.print-meta {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.85rem;
		align-items: stretch;
		margin-bottom: 0.6rem;
		border-bottom: 1px solid #bbb;
		padding-bottom: 0.5rem;
	}
	.print-disclaimer-wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.2rem;
		padding: 0.25rem 0.45rem 0.25rem 0;
		border-right: 1px solid #c9c9c9;
	}
	.print-disclaimer-label {
		margin: 0;
		font-family: Arial, sans-serif;
		font-size: 0.66rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #4a4a4a;
	}
	.print-meta .doprint {
		margin: 0;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #222;
	}
	.print-meta-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 0.14rem;
		padding-left: 0.15rem;
	}
	.print-as-of {
		margin: 0;
		font-family: 'Courier New', monospace;
		font-size: 0.72rem;
		color: #444;
	}
	.print-doc-title {
		margin: 0;
		font-family: Arial, sans-serif;
		font-size: 0.68rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #444;
	}
	.controls-header {
		display: flex;
		width: 100%;
		box-sizing: border-box;
		align-items: stretch;
		gap: 0.8rem;
		flex-wrap: wrap;
		padding: 0.2rem 0;
		border: 0;
		background: transparent;
		color: var(--white);
	}
	.controls-separator {
		width: 1px;
		height: 34px;
		background: rgba(255, 255, 255, 0.45);
		align-self: flex-end;
	}
	.control-group {
		border: 0;
		background: transparent;
		padding: 0 0.05rem;
		min-height: 34px;
		display: flex;
		align-items: center;
	}
	.toggles-control {
		position: relative;
		align-self: flex-end;
	}
	.help-control {
		position: relative;
		align-self: flex-end;
		margin-left: auto;
	}
	.color-dots-control {
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-end;
		gap: 0.25rem;
	}
	.header-toggle-label {
		font-size: 0.64rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.toggle-ghost-button {
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		padding: 0 0.65rem;
		height: 34px;
		min-width: 86px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.toggle-ghost-button .visual-toggle {
		margin-left: 0;
	}
	.visual-toggle.checked .track {
		background: var(--yellow-accent);
		border-color: #000;
	}
	.visual-toggle.checked .thumb {
		transform: translateX(18px);
	}
	.columns-button {
		border: 1px solid #000;
		background: var(--white);
		color: var(--grey);
		padding: 0 0.65rem;
		height: 34px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.help-button {
		border: 1px solid #000;
		background: var(--white);
		color: var(--grey);
		padding: 0 0.65rem;
		height: 34px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.column-popover {
		position: absolute;
		top: calc(100% + 0.45rem);
		left: 0;
		min-width: 230px;
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		box-shadow: 5px 5px 0 var(--yellow-accent);
		padding: 1.9rem 0.55rem 0.45rem;
		z-index: 30;
	}
	.help-popover {
		position: absolute;
		top: calc(100% + 0.45rem);
		right: 0;
		width: min(92vw, 420px);
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		box-shadow: 5px 5px 0 var(--yellow-accent);
		padding: 1.9rem 0.65rem 0.6rem;
		z-index: 31;
	}
	.help-popover h3 {
		margin: 0 0 0.4rem 0;
		text-transform: uppercase;
		font-size: 0.82rem;
		letter-spacing: 0.05em;
	}
	.help-popover ul {
		margin: 0;
		padding-left: 1rem;
	}
	.help-popover li {
		margin: 0.25rem 0;
		font-size: 0.76rem;
		line-height: 1.32;
	}
	.popover-close {
		position: absolute;
		top: 0.35rem;
		right: 0.35rem;
		width: 1.45rem;
		height: 1.45rem;
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.print-mode-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-end;
		gap: 0.25rem;
	}
	.print-mode-label {
		font-size: 0.64rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1;
	}
	.print-mode-toggle {
		display: inline-flex;
		border: 1px solid #000;
		height: 34px;
		background: var(--white);
		box-shadow: 2px 2px 0 var(--yellow-accent);
		box-sizing: border-box;
	}
	.print-mode-toggle button {
		border: 0;
		background: #fff;
		color: #111;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0 0.5rem;
		height: 34px;
		min-height: 34px;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		cursor: pointer;
		transition: background 0.2s ease;
	}
	.print-mode-toggle button + button {
		border-left: 1px solid #000;
	}
	.print-mode-toggle button.active {
		background: #e6e6e6;
		color: #000;
		box-shadow: inset 0 -2px 0 #000;
	}
	.print-mode-toggle button:hover {
		background: #f3f3f3;
	}
	.department-filter-wrap {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-end;
		gap: 0.25rem;
		min-width: 190px;
	}
	.department-filter-label {
		font-size: 0.64rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1;
	}
	.department-filter-select {
		border: 1px solid #000;
		background: var(--white);
		color: var(--grey);
		padding: 0 0.45rem;
		height: 34px;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		box-shadow: 2px 2px 0 var(--yellow-accent);
		min-width: 160px;
	}
	.department-filter-select:focus-visible {
		outline: 2px solid var(--yellow-accent);
		outline-offset: 1px;
	}
	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.45rem;
		margin: 0.22rem 0;
		font-size: 0.78rem;
		width: 100%;
		min-height: 24px;
	}
	.toggle-row.disabled-toggle {
		opacity: 0.5;
	}
	.toggle-label {
		text-transform: uppercase;
		letter-spacing: 0.03em;
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
	}
	.toggle {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 38px;
		height: 20px;
		margin-left: auto;
		flex: 0 0 auto;
	}
	.toggle input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}
	.track {
		position: absolute;
		inset: 0;
		background: #3a3a3a;
		border: 1px solid #f2f2f2;
		border-radius: 999px;
		transition: background 0.2s ease;
	}
	.thumb {
		position: absolute;
		left: 2px;
		width: 16px;
		height: 16px;
		background: var(--white);
		border-radius: 50%;
		transition: transform 0.2s ease;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}
	.toggle input:checked + .track {
		background: var(--yellow-accent);
		border-color: #000;
	}
	.toggle input:checked + .track + .thumb {
		transform: translateX(18px);
	}
	.print-button {
		border: 1px solid #000;
		background: var(--white);
		color: var(--grey);
		padding: 0 0.65rem;
		height: 34px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		align-self: flex-end;
	}
	.print-button:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	@media (max-width: 760px) {
		.controls-header {
			padding: 0.4rem;
			gap: 0.4rem;
		}
		.control-group {
			min-height: 76px;
		}
		.department-filter-wrap,
		.toggles-control,
		.color-dots-control,
		.help-control {
			width: 100%;
			min-width: 0;
		}
		.columns-button {
			width: 100%;
		}
		.column-popover {
			left: 0;
			right: 0;
			min-width: 0;
		}
		.help-popover {
			left: 0;
			right: 0;
			width: auto;
		}
		.print-button {
			margin-left: 0;
			width: 100%;
		}
		.controls-separator {
			display: none;
		}
		.print-mode-group {
			width: 100%;
			justify-content: space-between;
		}
		.modal-header {
			padding: 0.55rem 0.7rem 0.6rem;
		}
		.modal-header h2 {
			font-size: 1rem;
		}
	}
	tr.item-even {
		background: #f4f4f4;
	}
	tr.item-odd {
		background: #ffffff;
	}
	th {
		color: #fff;
		background: #2a2a2a;
		text-transform: uppercase;
		font-size: 0.76rem !important;
		letter-spacing: 0.09em;
		font-weight: 700;
	}
	.tg .col-id {
		width: 56px;
		text-align: center;
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
	}
	.tg .col-title {
		width: auto;
		min-width: 0;
		font-weight: 700;
		overflow-wrap: anywhere;
	}
	.tg .col-pricing {
		width: 98px;
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.title-main {
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 0.18rem;
	}
	.dept-chip {
		display: inline-flex;
		align-items: center;
		background: #ededed;
		border: 1px solid #bdbdbd;
		padding: 0.08rem 0.32rem;
		font-size: 0.64rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #333;
	}
	.deal-inline {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: #3a3a3a;
	}
	.price-inline {
		display: block;
		font-family: 'Courier New', monospace;
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1.1;
	}
	.tg.print-compact .col-optional {
		display: none;
	}
	.list-inline {
		display: flex;
		flex-wrap: wrap;
		gap: 0.18rem 0.22rem;
		align-items: center;
		align-content: center;
	}
	.tg td.col-effects,
	.tg td.col-colors,
	.tg td.col-sounds {
		vertical-align: middle;
	}
	.list-chip {
		display: inline-flex;
		align-items: center;
		background: #efefef;
		border: 1px solid #c6c6c6;
		padding: 0.08rem 0.28rem;
		font-size: 0.69rem;
		line-height: 1.1;
		white-space: nowrap;
	}
	.color-pill-mode :global(.color-dots) {
		padding: 0.18rem 0.35rem;
		gap: 0.22rem;
		background: #2d2d2d;
	}
	.color-pill-mode :global(.dot) {
		border-color: #fff;
	}
	.color-print-fallback {
		display: none;
	}
	.tg .desc-row td {
		background: inherit;
		border-bottom: 1px solid #d0d0d0;
		padding-top: 4px;
		padding-bottom: 8px;
		padding-left: 1rem;
	}
	.desc-content {
		display: inline-block;
		border-left: 3px solid #b8b8b8;
		padding-left: 0.45rem;
	}
	.tg tr.has-description > td {
		border-bottom: 0;
	}
	.desc-label {
		display: inline;
		margin-right: 0.3rem;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #444;
	}
	.desc-value {
		display: inline;
		font-size: 0.82rem;
		line-height: 1.38;
		color: #222;
	}
	img {
		width: 30%;
	}
	.print-disclaimer {
		margin: 0;
		font-family: Arial, sans-serif;
		font-size: 0.74rem;
		line-height: 1.38;
		color: #111;
	}
	@media print {
		@page {
			size: auto;
			margin: 0.82in 0.45in 0.78in;
		}
		:global(header, footer) {
			display: none !important;
		}
		.modal-frame,
		.modal,
		.modal-body {
			position: static !important;
			inset: auto !important;
			max-height: none !important;
			overflow: visible !important;
			width: 100% !important;
			height: auto !important;
			padding: 0 !important;
			border: 0 !important;
			box-shadow: none !important;
			background: white !important;
		}
		.modal-header,
		.modal-backdrop {
			display: none !important;
		}
		.pricelist-page > * {
			display: none !important;
		}
		.pricelist-page .print-sheet {
			display: block !important;
		}
		.pricelist-page .print-meta,
		.pricelist-page .print-logo,
		.pricelist-page .print-disclaimer,
		.pricelist-page .tg {
			display: block !important;
		}
		.pricelist-page .print-logo {
			width: 220px !important;
			height: auto;
			margin: 0 0 0.45rem 0;
			filter: grayscale(1) contrast(1.05);
		}
		.pricelist-page .print-sheet {
			border: 0 !important;
			box-shadow: none !important;
			padding: 0 !important;
			margin: 0 !important;
			background: transparent !important;
		}
		.pricelist-page .print-meta {
			display: grid !important;
			grid-template-columns: 1fr auto;
			gap: 0.35in;
			align-items: end;
			margin: 0 0 0.15in 0;
			border-bottom: 1px solid #666;
			padding-bottom: 0.08in;
		}
		.pricelist-page .print-disclaimer-wrap {
			border-right: 1px solid #9c9c9c;
			padding-right: 0.14in;
		}
		.pricelist-page .print-disclaimer-label {
			font-size: 7pt;
			letter-spacing: 0.08em;
			color: #404040;
		}
		.pricelist-page .doprint {
			font-size: 10pt;
			letter-spacing: 0.08em;
		}
		.pricelist-page .print-as-of {
			font-size: 8pt;
		}
		.pricelist-page .print-doc-title {
			font-size: 7pt;
		}
		.pricelist-page .tg {
			display: table !important;
			width: 100% !important;
			font-size: 9.2pt;
			border: 0;
		}
		.tg thead {
			display: table-header-group;
		}
		.tg tr,
		.tg td,
		.tg th {
			break-inside: avoid;
			page-break-inside: avoid;
		}
		.tg td {
			padding: 0.07in 0.06in;
			border: 0;
			border-bottom: 1px solid #9a9a9a;
			font-size: 8.9pt;
			line-height: 1.28;
		}
		.tg th {
			padding: 0.07in 0.06in;
			background: #2a2a2a;
			border: 0;
			border-bottom: 2px solid #111;
			font-size: 8pt !important;
			letter-spacing: 0.06em;
		}
		.tg td:not(:last-child)::after,
		.tg th:not(:last-child)::after {
			background: #b5b5b5;
		}
		.tg .col-id {
			width: 0.65in;
		}
		.tg .col-title {
			min-width: 0;
			width: auto;
		}
		.tg .col-pricing {
			width: 0.95in;
		}
		.tg .dept-chip {
			background: #efefef;
			border-color: #acacac;
			font-size: 7pt;
			padding: 0.01in 0.03in;
		}
		.tg .deal-inline {
			font-size: 7.3pt;
		}
		.tg .price-inline {
			font-size: 9.2pt;
		}
		.tg tr.item-even {
			background: #ececec;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		.tg tr.item-odd {
			background: #ffffff;
		}
		.tg th {
			color: #fff;
			background: #2a2a2a;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		.print-disclaimer {
			margin: 0;
			font-family: Arial, sans-serif;
			font-size: 9.5pt;
			line-height: 1.3;
		}
		.tg.print-compact .col-optional {
			display: none !important;
		}
		.tg .desc-row td {
			background: inherit;
			border-bottom: 1px solid #a8a8a8;
			padding-left: 0.11in;
		}
		.tg .desc-content {
			border-left: 2px solid #8e8e8e;
			padding-left: 0.05in;
		}
		.tg tr.has-description > td {
			border-bottom: 0;
		}
		.tg .list-inline {
			gap: 0.06in 0.06in;
		}
		.tg .list-chip {
			background: #f0f0f0;
			border-color: #b7b7b7;
			font-size: 7.3pt;
			padding: 0.01in 0.03in;
		}
		.color-pill-mode {
			display: none !important;
		}
		.color-print-fallback {
			display: flex !important;
		}
		.tg.color-dots-enabled .color-pill-mode {
			display: block !important;
		}
		.tg.color-dots-enabled .color-print-fallback {
			display: none !important;
		}
		.tg.color-dots-enabled .color-pill-mode :global(.color-dots) {
			background: transparent;
			padding: 0;
			gap: 0.05in;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
			forced-color-adjust: none;
		}
		.tg.color-dots-enabled .color-pill-mode :global(.dot) {
			width: 10pt;
			height: 10pt;
			border: 0.7pt solid #666;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
			forced-color-adjust: none;
		}
		.tg.color-dots-enabled .col-colors {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
			forced-color-adjust: none;
		}
		.tg .desc-label {
			font-size: 7.3pt;
		}
		.tg .desc-value {
			display: inline;
			font-size: 8.3pt;
			line-height: 1.25;
		}
	}
</style>
