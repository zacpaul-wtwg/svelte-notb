<script>
	// #region imports
	import { slugify } from '$lib/utility/slugify';
	import Ribbon from './ribbon.svelte';
	import { getThumb } from '$lib/utility/imageThumb';
	import { sentenceify } from '$lib/utility/slugify';
	import ShortenSentence from '$lib/utility/ShortenSentence.svelte';
import Clickers from './Clickers.svelte';
import { onMount, onDestroy, tick } from 'svelte';
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
	let collapsedHeight = 0;
	let descriptionEl;
	const burst = (event) => {
		if (!browser) return;
		const target = event.currentTarget;
		if (!target) return;
		const baseColor = window.getComputedStyle(target).backgroundColor;
		const particleCount = 8;
		for (let i = 0; i < particleCount; i++) {
			const particle = document.createElement('span');
			particle.className = 'particle';
			particle.style.background = baseColor;
			particle.style.boxShadow = `0 0 0 3px rgba(255,255,255,0.7)`;
			const angle = Math.random() * Math.PI * 2;
			const distance = 34 + Math.random() * 14;
			particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
			particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
			target.appendChild(particle);
			particle.addEventListener('animationend', () => particle.remove());
		}
	};
	const burstIntervals = new WeakMap();
	const startBurst = (event) => {
		if (!browser) return;
		const target = event.currentTarget;
		if (!target || burstIntervals.has(target)) return;
		burst(event);
		const id = window.setInterval(() => burst({ currentTarget: target }), 200);
		burstIntervals.set(target, id);
	};
	const stopBurst = (event) => {
		if (!browser) return;
		const target = event.currentTarget;
		const id = burstIntervals.get(target);
		if (id) {
			window.clearInterval(id);
			burstIntervals.delete(target);
		}
	};
	const handleDocumentClick = (event) => {
		if (!expanded) return;
		if (!descriptionEl || !event?.target) return;
		if (descriptionEl.contains(event.target)) return;
		expanded = false;
	};
	onMount(async () => {
		await tick();
		if (descriptionEl) collapsedHeight = Math.ceil(descriptionEl.getBoundingClientRect().height);
		if (browser) {
			document.addEventListener('click', handleDocumentClick);
		}
	});
	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleDocumentClick);
		}
	});
	// #endregion
</script>

<section class="card {expanded ? 'expanded' : ''}">
	<div class="title">
		<div class="meta">
			{#if colors.length > 0}
				<div class="color-dots">
					{#each colors.slice(0, 4) as color}
						<button
							type="button"
							class="dot"
							style="background: {color};"
							aria-label={`Color ${color}`}
							on:mouseenter={startBurst}
							on:mouseleave={stopBurst}
							on:click|stopPropagation={burst}
						></button>
					{/each}
				</div>
			{/if}
			{#if effects.length > 0}
				<div class="effects">
					{#each effects.slice(0, 2) as effect}
						<span class="effect-chip">{effect}</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	<a href={`/product/${id}/${slugify(title)}`} target="_blank" class="product-link">
		<div class="image-wrapper">
			<div class="image-container">
				<img loading="lazy" src={getThumb(imageThumb)} alt="{sentenceify(title)} product" />
			</div>
			<div class="ribbon-container">
				<div class="ribbon">
					<Ribbon
						string={`${deal} $${price}`}
						bgColor={ribbonColor.bg}
						fontColor={ribbonColor.text}
						padding={'.5'}
					/>
				</div>
			</div>
		</div>
	</a>
	<h4 class="product-name">{title}</h4>
	<div class="product-dept">Dept: {category}</div>
	<div class="description-wrap" style="min-height: {collapsedHeight}px;">
		<div
			class="description-card {expanded ? 'expanded' : ''}"
			role="button"
			tabindex="0"
			aria-expanded={expanded}
			bind:this={descriptionEl}
			on:click={() => (expanded = !expanded)}
			on:keydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					expanded = !expanded;
				}
			}}
		>
		{#if description === undefined}
			<p>
				We just added this bad-boy and there's not a description for it yet! Don't worry, we will
				get some good sentences down on this ASAP!
			</p>
		{:else}
			<p>
				<ShortenSentence string={description}>...</ShortenSentence>
			</p>
		{/if}
		<span class="description-hint">{expanded ? 'Tap to close' : 'Tap for details'}</span>
		</div>
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
		padding-bottom: 5em;
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
		padding: 0.3em 0.6em;
		min-height: 2.4em;
		font-weight: 100;
	}
	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
	}
	.color-dots {
		display: inline-flex;
		gap: 0.3em;
	}
	.dot {
		padding: 0;
		border: 1px solid var(--white);
		cursor: pointer;
		background: transparent;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
		position: relative;
		isolation: isolate;
	}
	:global(.particle) {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		animation: particle-burst 0.55s ease-out forwards;
		pointer-events: none;
	}
	@keyframes particle-burst {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3);
		}
	}
	.effects {
		display: inline-flex;
		gap: 0.4em;
	}
	.effect-chip {
		font-size: 0.65em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: var(--white);
		color: var(--grey);
		padding: 0.15em 0.4em;
		border-radius: 4px;
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

	.ribbon-container {
		position: absolute;
		right: 0;
		bottom: 0;
	}
	.ribbon {
		position: absolute;
		right: -30px;
		bottom: 5px;
		top: auto;
		transform: rotate(-10deg);
		font-size: 1.43em;
		pointer-events: none;
	}
	.ribbon :global(div) {
		display: inline-block;
		white-space: nowrap;
		text-transform: none;
	}
	a.product-link {
		text-decoration: none;
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
	.description-wrap {
		position: relative;
		margin: 0.5em 0.75em 0;
	}
	.description-card {
		background: var(--white);
		border: 1px solid var(--grey);
		padding: 0.5em 0.6em;
		cursor: pointer;
		transition: box-shadow 0.2s ease;
	}
	.description-card:focus {
		outline: 2px solid var(--yellow-accent);
		outline-offset: 2px;
	}
	.description-card p {
		margin: 0;
		line-height: 1.35;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.description-card.expanded p {
		-webkit-line-clamp: unset;
		overflow: visible;
	}
	.description-card.expanded {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		z-index: 40;
		box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);
	}
	.description-hint {
		display: inline-block;
		margin-top: 0.35em;
		font-size: 0.8em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--grey);
	}
</style>
