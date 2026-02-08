<script>
	import { onDestroy, onMount } from 'svelte';
	import Clickers from '$lib/components/Clickers.svelte';
	import ExpandableDescription from '$lib/components/ExpandableDescription.svelte';
	import { getThumb } from '$lib/utility/imageThumb';
	import { sentenceify, slugify } from '$lib/utility/slugify';

	export let products = [];
	export let intervalMs = 5000;

	const getColor = (deal) => {
		if (deal === '2 FOR') return { bg: 'red', text: 'white' };
		return { bg: 'yellow', text: 'grey' };
	};

	let activeIndex = 0;
	let isPaused = false;
	let autoplayId;
	let rootEl;
	let navDirection = 1;
	let animationPhase = 'idle';
	let pendingIndex = null;

	$: total = Array.isArray(products) ? products.length : 0;
	$: if (total === 0) activeIndex = 0;
	$: if (activeIndex >= total && total > 0) activeIndex = 0;
	$: activeProduct = total > 0 ? products[activeIndex] : null;
	$: ribbonColor = getColor(activeProduct?.deal);
	$: price = Number(activeProduct?.price ?? 0).toFixed(2);

	const beginQueuedTransition = () => {
		if (pendingIndex === null || pendingIndex === activeIndex) return;
		animationPhase = 'out';
	};

	const queueGoTo = (index, direction = 1) => {
		if (total <= 0) return;
		const normalized = (index + total) % total;
		if (normalized === activeIndex && animationPhase === 'idle') return;
		navDirection = direction;
		pendingIndex = normalized;
		if (animationPhase === 'idle') beginQueuedTransition();
	};

	const handleSlideAnimationEnd = () => {
		if (animationPhase === 'out') {
			if (pendingIndex !== null) {
				activeIndex = pendingIndex;
				pendingIndex = null;
			}
			animationPhase = 'in';
			return;
		}

		if (animationPhase === 'in') {
			animationPhase = 'idle';
			if (pendingIndex !== null && pendingIndex !== activeIndex) beginQueuedTransition();
		}
	};

	const next = () => {
		queueGoTo(activeIndex + 1, 1);
	};

	const prev = () => {
		queueGoTo(activeIndex - 1, -1);
	};

	const goTo = (index) => {
		const direction = index >= activeIndex ? 1 : -1;
		queueGoTo(index, direction);
	};

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
			<div class="heading-copy">
				<h2>{activeProduct ? sentenceify(activeProduct.title) : 'Featured Fireworks'}</h2>
			</div>
			<div
				class="price-tag header-price-tag"
				style={`--price-bg:${ribbonColor.bg === 'yellow' ? 'var(--yellow)' : ribbonColor.bg === 'red' ? 'var(--red)' : 'var(--grey)'}; --price-fg:${ribbonColor.text === 'white' ? 'var(--white)' : 'var(--grey)'}`}
			>
				<span class="price-text">{activeProduct.deal} ${price}</span>
			</div>
		</div>

		<div class="viewport">
			<article
				class="slide"
				class:is-out-next={animationPhase === 'out' && navDirection > 0}
				class:is-out-prev={animationPhase === 'out' && navDirection < 0}
				class:is-in-next={animationPhase === 'in' && navDirection > 0}
				class:is-in-prev={animationPhase === 'in' && navDirection < 0}
				on:animationend={handleSlideAnimationEnd}
			>
				<div class="media">
					<div class="image-wrapper">
						<div class="image-container">
							<img
								src={getThumb(activeProduct.imageThumb)}
								alt={`${sentenceify(activeProduct.title)} product`}
								loading="lazy"
							/>
						</div>
					</div>
				</div>
				<div class="content">
					<div class="description-wrap">
						<ExpandableDescription
							text={activeProduct.description}
							fallbackText="This featured item was just added. Details are coming soon, but it is available now."
							truncateWords={25}
							lineClamp={4}
							overlay={false}
						/>
					</div>
					<div class="actions">
						<div class="clickers-wrap">
							<Clickers product={activeProduct} inline={true} />
						</div>
						<a class="mobile-details-button" href={`/product/${activeProduct.id}/${slugify(activeProduct.title)}`}>
							DETAILS
						</a>
					</div>
				</div>
			</article>
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

		<div class="controls">
			<button
				type="button"
				class="nav-button"
				on:click={prev}
				aria-label="Previous featured product"
			>
				<span aria-hidden="true">‹</span>
			</button>
			<button type="button" class="nav-button" on:click={next} aria-label="Next featured product">
				<span aria-hidden="true">›</span>
			</button>
		</div>
	{/if}
</section>

<style lang="scss">
	.featured-carousel-wrap {
		width: 100%;
		max-width: 100%;
		margin: 0;
		padding: 0.75rem 0.75rem 3rem;
		border: 2px solid var(--grey);
		background: var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		box-sizing: border-box;
		position: relative;
	}

	.heading-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.7rem;
		padding: 0.5rem 0.75rem;
		background: var(--grey);
		border: 1px solid var(--grey);
		position: relative;
		overflow: visible;
	}

	.heading-copy {
		min-width: 0;
	}

	.heading-row h2 {
		margin: 0;
		color: var(--white);
		font-size: clamp(1.5rem, 3vw, 2.6rem);
		letter-spacing: 0.02em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.controls {
		display: flex;
		gap: 0.22rem;
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
	}

	.nav-button {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		width: 2.25em;
		height: 2.25em;
		font-weight: 700;
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.2rem;
		line-height: 1;
		cursor: pointer;
		box-shadow: 2px 2px 0 var(--yellow-accent);
		transform: skew(-14deg);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.nav-button span {
		display: inline-block;
		transform: skew(14deg);
	}

	.controls .nav-button:first-child {
		border-radius: 6px 0 0 6px;
	}

	.controls .nav-button:last-child {
		border-radius: 0 6px 6px 0;
	}

	.nav-button:hover {
		transform: translate(-1px, -1px) skew(-14deg);
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}

	.viewport {
		overflow: hidden;
		width: 100%;
		border: 1px solid var(--grey);
		padding: 0.55rem;
		background: var(--off-white);
		box-sizing: border-box;
	}

	.slide {
		display: grid;
		grid-template-columns: 338px minmax(0, 1fr);
		height: 338px;
		background: var(--white);
		border: 1px solid var(--grey);
		box-sizing: border-box;
		overflow: hidden;
		will-change: transform, opacity;
		position: relative;
	}

	.slide.is-out-next {
		animation: slide-out-next 220ms ease forwards;
	}

	.slide.is-out-prev {
		animation: slide-out-prev 220ms ease forwards;
	}

	.slide.is-in-next {
		animation: slide-in-next 220ms ease forwards;
	}

	.slide.is-in-prev {
		animation: slide-in-prev 220ms ease forwards;
	}

	@keyframes slide-out-next {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(-30px);
			opacity: 0;
		}
	}

	@keyframes slide-in-next {
		from {
			transform: translateX(30px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slide-out-prev {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(30px);
			opacity: 0;
		}
	}

	@keyframes slide-in-prev {
		from {
			transform: translateX(-30px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.media {
		width: 338px;
		height: 338px;
		background: var(--off-white);
		border-right: 1px solid var(--grey);
		overflow: hidden;
		box-sizing: border-box;
	}

	.image-wrapper {
		position: relative;
		height: 100%;
	}

	.image-container {
		position: relative;
		overflow: hidden;
		height: 100%;
		background: #f5f5f5;
	}

	.media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.price-tag {
		position: absolute;
		right: 0.85rem;
		bottom: 0;
		background: var(--price-bg);
		color: var(--price-fg);
		padding: 0.35em 0.7em;
		transform: translateY(25%) skew(-14deg);
		box-shadow: 4px 4px 0 var(--grey);
		border: 1px solid var(--grey);
		z-index: 8;
	}

	.price-text {
		display: inline-block;
		transform: skew(14deg);
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.85em;
		white-space: nowrap;
		text-transform: none;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.6rem 0.78rem;
		background:
			linear-gradient(180deg, rgba(220, 237, 34, 0.12), rgba(220, 237, 34, 0)), var(--white);
		overflow: hidden;
		position: relative;
	}

	.description-wrap {
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: nowrap;
		justify-content: flex-end;
		margin-top: auto;
		padding-right: 0.15rem;
		padding-bottom: 0.1rem;
	}

	.mobile-details-button {
		display: none;
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

	@media (max-width: 1024px) {
		.heading-row {
			grid-template-columns: 1fr;
			align-items: flex-start;
			padding-bottom: 1.2rem;
		}

		.slide {
			grid-template-columns: 1fr;
			height: auto;
		}

		.media {
			width: 100%;
			height: min(75vw, 320px);
			border-right: 0;
			border-bottom: 1px solid var(--grey);
		}

		.content {
			padding: 0.72rem 0.78rem;
		}

		.price-tag {
			right: 0.75rem;
			transform: translateY(25%) skew(-14deg);
		}
	}

	@media (max-width: 700px) {
		.featured-carousel-wrap {
			padding: 0.55rem 0.55rem 0.8rem;
			margin: 0;
		}

		.heading-row {
			padding-bottom: 0.8rem;
			margin-bottom: 0.5rem;
		}

		.heading-row h2 {
			white-space: normal;
			overflow: visible;
			text-overflow: clip;
			padding-right: 0.2rem;
		}

		.price-tag {
			right: 0.55rem;
			bottom: -28px;
			transform: skew(-14deg);
		}

		.price-text {
			font-size: 1.3em;
		}

		.viewport {
			padding: 0.4rem;
		}

		.media {
			height: min(58vw, 240px);
		}

		.description-wrap,
		.dots {
			display: none;
		}

		.slide {
			overflow: visible;
		}

		.content {
			overflow: visible;
			padding: 0.55rem 0.7rem 0.85rem;
		}

		.actions {
			padding-right: 0;
			padding-bottom: 0;
			margin-top: 0.2rem;
		}

		.controls {
			position: static;
			justify-content: flex-end;
			margin-top: 0.5rem;
			padding-top: 0.2rem;
		}

		.clickers-wrap {
			display: none;
		}

		.mobile-details-button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			letter-spacing: 0.04em;
			font-family: Langdon, Arial, sans-serif;
			font-size: 1.1rem;
			color: var(--white);
			background: var(--grey);
			border: 1px solid var(--grey);
			box-shadow: 2px 2px 0 var(--yellow-accent);
			padding: 0.45rem 0.8rem;
			text-decoration: none;
			width: 80%;
			margin: 0 auto;
		}
	}
</style>
