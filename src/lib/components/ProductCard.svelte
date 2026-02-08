<script>
	// #region imports
	import { slugify } from '$lib/utility/slugify';
	import { getThumb } from '$lib/utility/imageThumb';
	import { sentenceify } from '$lib/utility/slugify';
	import Clickers from './Clickers.svelte';
	import ColorDots from '$lib/components/ColorDots.svelte';
	import ExpandableDescription from '$lib/components/ExpandableDescription.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	export let product;
	// #endregion

	// #region Functions
	export const getColor = function (deal) {
		let bg;
		let text;
		if (deal === '2 FOR') {
			bg = 'red';
			text = 'white';
		} else {
			bg = 'yellow';
			text = 'grey';
		}

		return { bg, text };
	};
	// #endregion

	// #region Variables
	$: ribbonColor = getColor(product.deal);
	$: description = product.description;
	$: title = product.title;
	$: price = product.price.toFixed(2);
	$: id = product.id;
	$: deal = product.deal;
	$: category = product.category;
	$: imageThumb = product.imageThumb;
	const colorOrder = [
		'red',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet',
		'purple',
		'pink',
		'white',
		'gold',
		'silver',
		'multi',
		'multicolor',
		'mixed'
	];
	const colorRank = (value) => {
		const normalized = String(value || '').toLowerCase();
		const index = colorOrder.findIndex((color) => normalized.includes(color));
		return index === -1 ? 999 : index;
	};
	const sortColors = (values) => [...values].sort((a, b) => colorRank(a) - colorRank(b));
	$: colors = sortColors(Array.isArray(product.colors) ? product.colors : []);
	$: effects = Array.isArray(product.effects) ? product.effects : [];
	let expanded = false;
	let showEffects = false;
	let effectsPopover;
	const handleEffectsClick = (event) => {
		event.stopPropagation();
		showEffects = !showEffects;
	};
	const handleEffectsDocumentClick = (event) => {
		if (!showEffects) return;
		if (!effectsPopover || !event?.target) return;
		if (effectsPopover.contains(event.target)) return;
		showEffects = false;
	};
	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleEffectsDocumentClick);
		}
	});
	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleEffectsDocumentClick);
		}
	});
	// #endregion
</script>

<section class="card {expanded ? 'expanded' : ''}">
	<div class="title">
		<div class="meta">
			{#if colors.length > 0}
				<div class="meta-top">
					<ColorDots {colors} dotSize={20} burstInterval={200} />
					<button class="effects-toggle" type="button" on:click={handleEffectsClick}>
						<span class="effects-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true">
								<path
									d="M7 1l1.2 3.8L12.3 6 8.2 7.3 7 11 5.8 7.3 1.7 6l4.1-1.2L7 1zm10 2.5l1.8 5.2 5.2 1.8-5.2 1.9L17 18l-1.8-5.4-5.2-1.9 5.2-1.8L17 3.5zm-4 11l1.1 3.2 3.2 1.1-3.2 1.1-1.1 3.2-1.1-3.2-3.2-1.1 3.2-1.1 1.1-3.2z"
									fill="currentColor"
								/>
							</svg>
						</span>
						<span class="sr-only">Show effects</span>
					</button>
				</div>
			{/if}
			<div class="meta-bottom"></div>
			{#if showEffects}
				<div class="effects-popover" bind:this={effectsPopover}>
					{#if effects.length > 0}
						<div class="effects">
							{#each effects as effect}
								<span class="effect-chip">{effect}</span>
							{/each}
						</div>
					{:else}
						<span class="effect-chip">No effects listed</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<div class="image-wrapper">
		<div class="image-container">
			<img loading="lazy" src={getThumb(imageThumb)} alt="{sentenceify(title)} product" />
		</div>
		<div
			class="price-tag"
			style={`--price-bg:${ribbonColor.bg === 'yellow' ? 'var(--yellow)' : ribbonColor.bg === 'red' ? 'var(--red)' : 'var(--grey)'}; --price-fg:${ribbonColor.text === 'white' ? 'var(--white)' : 'var(--grey)'}`}
		>
			<span class="price-text">{deal} ${price}</span>
		</div>
	</div>
	<h4 class="product-name">{title}</h4>
	<div class="product-dept">
		<span class="dept-chip">Dept: {category}</span>
	</div>
	<div class="description-wrap">
		<ExpandableDescription
			text={description}
			fallbackText="We just added this bad-boy and there's not a description for it yet! Don't worry, we will get some good sentences down on this ASAP!"
			truncateWords={25}
			lineClamp={3}
			overlay={true}
			bind:expanded
		/>
	</div>
	<Clickers {product} />
</section>

<style lang="scss">
	.card {
		width: 300px;
		border: solid thin var(--grey);
		display: block;
		position: relative;
		z-index: 3;
		padding-bottom: 1.1em;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		background: var(--white);
		overflow: visible;
	}
	.card.expanded {
		z-index: 20;
	}

	.title {
		background: var(--grey);
		color: var(--white);
		padding: 0.05em 0.55em 0.3em;
		min-height: 3em;
		font-weight: 100;
		position: relative;
	}
	.meta {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: space-between;
		gap: 0.15em;
		min-height: 2.6em;
	}
	.meta-top,
	.meta-bottom {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
	.meta-top {
		justify-content: space-between;
		gap: 0.4em;
	}
	.effects-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		border-radius: 0;
		box-shadow: 3px 3px 0 var(--yellow-accent);
		cursor: pointer;
	}
	.effects-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		line-height: 1;
	}
	.effects-icon svg {
		width: 24px;
		height: 24px;
		display: block;
	}
	.effects-popover {
		position: absolute;
		right: 0.6em;
		top: calc(100% - 2px);
		background: var(--white);
		border: 1px solid var(--grey);
		padding: 0.4em 0.6em;
		box-shadow: 4px 4px 0 var(--yellow-accent);
		z-index: 5;
	}
	.effects-popover .effects {
		flex-wrap: wrap;
		max-width: 220px;
	}
	.effects {
		display: inline-flex;
		gap: 0.4em;
		flex-wrap: nowrap;
		overflow: hidden;
		white-space: nowrap;
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
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.image-wrapper {
		position: relative;
	}
	.image-container {
		position: relative;
		overflow: hidden;
		height: 180px;
		background: #f5f5f5;
		img {
			object-fit: cover;
			height: 100%;
			width: 100%;
			transition: transform 0.3s;
		}
		img:hover {
			transform: scale(1.25);
		}
	}

	.price-tag {
		position: absolute;
		right: -16px;
		top: 121px;
		background: var(--price-bg);
		color: var(--price-fg);
		padding: 0.35em 0.7em;
		transform: skew(-14deg);
		box-shadow: 4px 4px 0 var(--grey);
		border: 1px solid var(--grey);
	}
	.price-text {
		display: inline-block;
		transform: skew(14deg);
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.85em;
		white-space: nowrap;
		text-transform: none;
	}
	h4.product-name {
		margin: 0.5em 0.75em 0;
		font-size: 1.35em;
		line-height: 1.2;
	}
	.product-dept {
		margin: 0.1em 0.75em 0;
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--grey);
	}
	.dept-chip {
		display: inline-flex;
		align-items: center;
		background: var(--grey);
		color: var(--white);
		padding: 0.2em 0.55em;
		border-radius: 999px;
	}
	.description-wrap {
		margin: 0.5em 0.75em 0;
	}

	.description-wrap :global(.description-card) {
		position: relative;
		padding-top: 1.6em;
	}

	.description-wrap :global(.description-card)::before {
		content: 'DESCRIPTION';
		position: absolute;
		left: 0.6em;
		top: 0.35em;
		font-size: 0.9em;
		font-weight: 500;
		letter-spacing: 0;
		text-transform: uppercase;
		color: var(--grey);
		pointer-events: none;
	}

	.description-wrap :global(.description-card)::after {
		content: '';
		position: absolute;
		right: 0.7em;
		top: 0.5em;
		width: 7px;
		height: 7px;
		border-right: 2px solid var(--grey);
		border-bottom: 2px solid var(--grey);
		transform: rotate(45deg);
		transition: transform 0.2s ease;
		pointer-events: none;
	}

	.description-wrap :global(.description-card.expanded)::after {
		transform: rotate(-135deg);
	}

	@media (max-width: 700px) {
		.description-wrap :global(.description-card:not(.expanded) p) {
			display: none;
		}

		.description-wrap {
			margin-bottom: 0.15em;
		}

		.card :global(.clicker-container) {
			margin-top: 24px;
		}
	}
</style>
