<script>
	import { createEventDispatcher } from 'svelte';
	import { onDestroy, onMount } from 'svelte';
	import ColorDots from '$lib/components/ColorDots.svelte';
	import { getThumb } from '$lib/utility/imageThumb';
	import { sentenceify, slugify } from '$lib/utility/slugify';

	export let products = [];
	export let intervalMs = 5000;
	const dispatch = createEventDispatcher();

	let activeIndex = 0;
	let isPaused = false;
	let autoplayId;
	let rootEl;

	$: total = Array.isArray(products) ? products.length : 0;
	$: if (total === 0) activeIndex = 0;
	$: if (activeIndex >= total && total > 0) activeIndex = 0;

	const getProductHref = (product) => `/product/${product.id}/${slugify(product.title ?? '')}`;
	const openProduct = (product) => dispatch('openproduct', { product });
	const toArray = (value) => {
		if (Array.isArray(value)) return value.filter(Boolean);
		if (typeof value === 'string') return value.split(' ').filter(Boolean);
		return [];
	};
	const specLabel = (value, suffix = '') =>
		Number.isFinite(value) ? `${value.toLocaleString('en-US')}${suffix}` : 'Unlisted';

	const goTo = (index) => {
		if (total <= 0) return;
		activeIndex = (index + total) % total;
	};

	const next = () => goTo(activeIndex + 1);
	const prev = () => goTo(activeIndex - 1);

	const startAutoplay = () => {
		clearInterval(autoplayId);
		autoplayId = setInterval(() => {
			if (isPaused || total <= 1) return;
			next();
		}, intervalMs);
	};

	const pause = () => {
		isPaused = true;
	};

	const resume = (event) => {
		if (!rootEl) {
			isPaused = false;
			return;
		}
		if (event?.relatedTarget && rootEl.contains(event.relatedTarget)) return;
		isPaused = false;
	};

	onMount(() => {
		startAutoplay();
	});

	onDestroy(() => {
		clearInterval(autoplayId);
	});
</script>

<section
	class="featured-carousel-wrap"
	aria-label="Featured products carousel"
	bind:this={rootEl}
	on:mouseenter={pause}
	on:mouseleave={resume}
	on:focusin={pause}
	on:focusout={resume}
>
	{#if total === 0}
		<p class="empty-state">No featured products are currently marked in Comcash.</p>
	{:else}
		<div class="heading-row">
			<h2>Featured Fireworks</h2>
			<div class="controls">
				<button
					type="button"
					class="nav-button"
					on:click={prev}
					aria-label="Previous featured product"
				>
					Prev
				</button>
				<button type="button" class="nav-button" on:click={next} aria-label="Next featured product">
					Next
				</button>
			</div>
		</div>

		<div class="viewport">
			<div class="track" style={`transform: translateX(-${activeIndex * 100}%);`}>
				{#each products as product, index (product.id)}
					<article class="slide" aria-hidden={index !== activeIndex}>
						<div class="media">
							<img
								src={getThumb(product.imageThumb)}
								alt={`${sentenceify(product.title)} product`}
								loading="lazy"
							/>
						</div>
						<div class="content">
							<p class="kicker">Featured Pick</p>
							<h3>{product.title}</h3>
							<h4 class="section-title">Description</h4>
							<p class="description">
								{product.description ||
									'This featured item was just added. Details are coming soon, but it is available now.'}
							</p>
							<div class="attributes">
								<div class="attribute-column">
									<h4 class="section-title">Colors</h4>
									<ColorDots
										colors={toArray(product.colors)}
										maxDots={8}
										dotSize={16}
										burstInterval={220}
									/>
								</div>
								<div class="attribute-column">
									<h4 class="section-title">Effects</h4>
									<div class="effects-list">
										{#each toArray(product.effects).slice(0, 6) as effect}
											<span class="effect-chip">{effect}</span>
										{:else}
											<span class="effect-chip">Unlisted</span>
										{/each}
									</div>
								</div>
								<div class="attribute-column">
									<h4 class="section-title">Sounds</h4>
									<div class="effects-list">
										{#each toArray(product.sounds).slice(0, 6) as sound}
											<span class="effect-chip">{sound}</span>
										{:else}
											<span class="effect-chip">Unlisted</span>
										{/each}
									</div>
								</div>
							</div>
							<div class="meta-row">
								<span class="deal">{product.deal} ${Number(product.price ?? 0).toFixed(2)}</span>
								<span class="category">Dept: {product.category}</span>
								<span class="category">Height: {specLabel(product.height, ' ft')}</span>
								<span class="category">Duration: {specLabel(product.duration, ' s')}</span>
								<span class="category">Shots: {specLabel(product.shotCount)}</span>
							</div>
							<div class="actions">
								<a
									class="action action-primary"
									href={getProductHref(product)}
									on:click|preventDefault={() => openProduct(product)}
								>
									View Details
								</a>
								<a class="action action-quiet" href="/product/wishlist">Wishlist</a>
								<a class="action action-quiet" href="/product">Browse Catalog</a>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>

		<div class="dots" role="tablist" aria-label="Featured product slides">
			{#each products as product, index (product.id)}
				<button
					type="button"
					class:active={index === activeIndex}
					class="dot"
					on:click={() => goTo(index)}
					aria-label={`Go to featured product ${index + 1}`}
					aria-current={index === activeIndex ? 'true' : 'false'}
				></button>
			{/each}
		</div>
	{/if}
</section>

<style lang="scss">
	.featured-carousel-wrap {
		width: 100%;
		max-width: 100%;
		margin: 2rem 0 3rem;
		padding: 0.75rem;
		border: 2px solid var(--grey);
		background: var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		box-sizing: border-box;
	}

	.heading-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.7rem;
		padding: 0.5rem 0.75rem;
		background: var(--grey);
		border: 1px solid var(--grey);
	}

	.heading-row h2 {
		margin: 0;
		color: var(--white);
		font-size: clamp(1.25rem, 2.4vw, 2rem);
		letter-spacing: 0.02em;
	}

	.controls {
		display: flex;
		gap: 0.5rem;
	}

	.nav-button {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		padding: 0.4rem 0.8rem;
		font-weight: 700;
		font-family: Langdon, Arial, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		box-shadow: 3px 3px 0 var(--yellow-accent);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.nav-button:hover {
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0 var(--yellow-accent);
	}

	.viewport {
		overflow: hidden;
		width: 100%;
		border: 1px solid var(--grey);
		padding: 0.55rem;
		background: var(--off-white);
		box-sizing: border-box;
	}

	.track {
		display: flex;
		transition: transform 0.45s ease;
		will-change: transform;
	}

	.slide {
		min-width: 100%;
		display: grid;
		grid-template-columns: minmax(280px, 48%) minmax(0, 1fr);
		background: var(--white);
		min-height: 480px;
		border: 1px solid var(--grey);
	}

	.media {
		height: 100%;
		background: var(--off-white);
		border-right: 1px solid var(--grey);
		overflow: hidden;
	}

	.media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 1.2rem 1.3rem;
		background:
			linear-gradient(180deg, rgba(220, 237, 34, 0.12), rgba(220, 237, 34, 0)), var(--white);
	}

	.kicker {
		margin: 0;
		font-weight: 800;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--red);
		font-family: Langdon, Arial, sans-serif;
	}

	.content h3 {
		margin: 0;
		font-size: clamp(1.8rem, 3.2vw, 3rem);
		line-height: 0.95;
		text-shadow: 1px 1px 0 var(--white);
	}

	.section-title {
		margin: 0;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--grey);
		border-bottom: 1px solid var(--grey);
		padding-bottom: 0.22rem;
	}

	.description {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.45;
		max-width: 46ch;
	}

	.attributes {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.7rem;
	}

	.attribute-column {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.effects-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.effect-chip {
		display: inline-flex;
		align-items: center;
		font-size: 0.67rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.18rem 0.42rem;
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: auto;
	}

	.deal,
	.category {
		display: inline-block;
		padding: 0.35rem 0.55rem;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid var(--grey);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.deal {
		background: var(--yellow);
		box-shadow: 3px 3px 0 var(--grey);
	}

	.category {
		background: var(--off-white);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
		margin-top: 0.3rem;
	}

	.action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.55rem 0.9rem;
		font-weight: 800;
		text-transform: uppercase;
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		text-decoration: none;
		border: 1px solid var(--grey);
		box-shadow: 3px 3px 0 var(--yellow-accent);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.action:hover {
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0 var(--yellow-accent);
	}

	.action-primary {
		background: var(--grey);
		color: var(--white);
	}

	.action-primary:visited {
		color: var(--white);
	}

	.action-quiet {
		background: var(--white);
		color: var(--grey);
	}

	.action-quiet:visited {
		color: var(--grey);
	}

	.dots {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.8rem;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 0;
		border: 1px solid var(--grey);
		background: var(--white);
		cursor: pointer;
		padding: 0;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}

	.dot.active {
		background: var(--grey);
	}

	.empty-state {
		margin: 0;
		color: var(--grey);
	}

	@media (max-width: 900px) {
		.slide {
			grid-template-columns: 1fr;
			min-height: 0;
		}

		.media {
			height: min(52vw, 360px);
			border-right: 0;
			border-bottom: 1px solid var(--grey);
		}

		.content h3 {
			font-size: clamp(1.5rem, 8vw, 2.4rem);
		}

		.attributes {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 680px) {
		.featured-carousel-wrap {
			padding: 0.55rem;
			margin: 1.1rem 0 2rem;
		}

		.heading-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.viewport {
			padding: 0.4rem;
		}
	}
</style>
