<script>
	import { onDestroy } from 'svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import ColorDots from '$lib/components/ColorDots.svelte';
	import { formatDealLabel, getDealDivisor } from '$lib/cart/deal';
	import Ribbon from '$lib/components/ribbon.svelte';
	import SpecTable from '$lib/components/SpecTable.svelte';
	import { getCanonicalProductUrl } from '$lib/utility/productUrl';

	export let product;
	export let onClose = () => {};

	$: colorsArray = product?.colors?.split(' ') ?? ['unlisted'];
	$: effectsArray = product?.effects?.split(' ') ?? ['unlisted'];
	$: soundsArray = product?.sounds?.split(' ') ?? ['unlisted'];
	$: images = product?.images ?? [];
	$: hasImages = images.length > 0;
	let selectedIndex = 0;
	$: selectedImage = images[selectedIndex];
	let lightboxOpen = false;
	$: displayPrice = Number(product?.price ?? 0).toFixed(2);
	$: dealLabel = formatDealLabel(product?.brand || product?.deal);
	$: productUrl = getCanonicalProductUrl(product?.id, product?.title);
	let shareState = 'idle';
	let shareResetTimeout = null;

	const openLightbox = (event) => {
		event.preventDefault();
		lightboxOpen = true;
	};
	const closeLightbox = () => {
		lightboxOpen = false;
	};
	const prevImage = () => {
		if (!images.length) return;
		selectedIndex = (selectedIndex - 1 + images.length) % images.length;
	};
	const nextImage = () => {
		if (!images.length) return;
		selectedIndex = (selectedIndex + 1) % images.length;
	};
	const handleKey = (event) => {
		if (!lightboxOpen) return;
		if (event.key === 'Escape') {
			closeLightbox();
		} else if (event.key === 'ArrowLeft') {
			prevImage();
		} else if (event.key === 'ArrowRight') {
			nextImage();
		}
	};
	const clearShareResetTimeout = () => {
		if (shareResetTimeout) {
			window.clearTimeout(shareResetTimeout);
			shareResetTimeout = null;
		}
	};
	const setShareState = (nextState) => {
		shareState = nextState;
		clearShareResetTimeout();
		if (nextState !== 'idle') {
			shareResetTimeout = window.setTimeout(() => {
				shareState = 'idle';
				shareResetTimeout = null;
			}, 2000);
		}
	};
	const fallbackCopyText = (value) => {
		if (typeof document === 'undefined') return false;
		const field = document.createElement('textarea');
		field.value = value;
		field.setAttribute('readonly', '');
		field.style.position = 'fixed';
		field.style.opacity = '0';
		document.body.appendChild(field);
		field.select();
		field.setSelectionRange(0, field.value.length);
		let copied = false;
		try {
			copied = document.execCommand('copy');
		} finally {
			document.body.removeChild(field);
		}
		return copied;
	};
	const copyProductLink = async () => {
		if (!productUrl) {
			setShareState('error');
			return;
		}
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(productUrl);
				setShareState('copied');
				return;
			}
			if (fallbackCopyText(productUrl)) {
				setShareState('copied');
				return;
			}
			setShareState('error');
		} catch {
			if (fallbackCopyText(productUrl)) {
				setShareState('copied');
				return;
			}
			setShareState('error');
		}
	};

	onDestroy(() => {
		clearShareResetTimeout();
	});
</script>

<svelte:window on:keydown={handleKey} />

{#if product}
	<div class="modal-page">
		<div class="modal-frame">
			<div class="modal-backdrop" on:click={onClose}></div>
			<div class="modal" role="dialog" aria-modal="true" aria-label="Product details">
				<div class="modal-header">
					<h2>{product.title}</h2>
					<div class="modal-actions">
						<button
							class="modal-share"
							class:copied={shareState === 'copied'}
							class:error={shareState === 'error'}
							type="button"
							aria-live="polite"
							aria-label={
								shareState === 'copied'
									? 'Product link copied'
									: shareState === 'error'
										? 'Copy product link failed'
										: 'Copy production product link'
							}
							on:click={copyProductLink}
						>
							<span class="modal-share-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
									<path
										d="M10.59 13.41a1 1 0 0 0 1.41 1.41l3.83-3.83a3 3 0 0 0-4.24-4.24l-1.41 1.41a1 1 0 0 0 1.41 1.41L13 8.17a1 1 0 1 1 1.41 1.41L10.59 13.41zm2.82-2.82a1 1 0 0 0-1.41-1.41l-3.83 3.83a3 3 0 0 0 4.24 4.24l1.41-1.41a1 1 0 0 0-1.41-1.41L11 15.83a1 1 0 1 1-1.41-1.41l3.82-3.83z"
										fill="currentColor"
									/>
								</svg>
							</span>
							<span class="modal-share-label">
								{#if shareState === 'copied'}
									Copied
								{:else if shareState === 'error'}
									Copy Failed
								{:else}
									Copy Link
								{/if}
							</span>
						</button>
						<button class="modal-close" type="button" on:click={onClose}>×</button>
					</div>
				</div>
				<Container>
					<div class="product-container">
						<div class="image-container">
							<div class="ribbon-container">
								{#if getDealDivisor(product?.brand || product?.deal) === 2}
									<h3 class="ribbon">
										<Ribbon
											bgColor={'red'}
											fontColor={'white'}
											padding={'1'}
											string={`${dealLabel} $${displayPrice}`}
										/>
									</h3>
								{:else}
									<h3 class="ribbon">
										<Ribbon
											bgColor={'yellow'}
											fontColor={'grey'}
											padding={'1'}
											string={`${dealLabel} $${displayPrice}`}
										/>
									</h3>
								{/if}
							</div>
							{#if !hasImages}
								<div class="images">
									<img
										src={'/product-placeholder.jpg'}
										alt={`${product.title} placeholder image`}
									/>
								</div>
							{:else}
								<div class="gallery">
									<a class="main-image" href={selectedImage.full} on:click={openLightbox}>
										<img
											src={selectedImage.full}
											alt={`${product.title} ${selectedImage.title ?? ''}`}
										/>
									</a>
									{#if images.length > 1}
										<div class="thumbs">
											{#each images as image, index}
												<button
													type="button"
													class:selected={index === selectedIndex}
													on:click={() => (selectedIndex = index)}
												>
													<img
														src={image.full.replace('products/', 'products/thumb_')}
														alt={`${product.title} thumbnail ${index + 1}`}
													/>
												</button>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
							{#if product.youtubeId}
								<div class="video-frame">
									<iframe
										src={`https://www.youtube.com/embed/${product.youtubeId}?autoplay=1&mute=1`}
										allowfullscreen
										title={`youtube video of ${product.title}`}
									></iframe>
								</div>
							{/if}
						</div>
						<div class="details-container">
							<h2 class="section-title">Description</h2>
							<p class="description-text">{product.description}</p>
							<div class="attributes">
								<div class="colors-list list">
									<h2 class="section-title">Colors</h2>
									<ColorDots colors={colorsArray} maxDots={8} dotSize={18} burstInterval={220} />
								</div>
								<div class="effects-list list">
									<h2 class="section-title">Effects</h2>
									<div class="effects">
										{#each effectsArray as effect}
											<span class="effect-chip">{effect}</span>
										{/each}
									</div>
								</div>
								<div class="sounds-list list">
									<h2 class="section-title">Sounds</h2>
									<div class="effects">
										{#each soundsArray as sound}
											<span class="effect-chip">{sound}</span>
										{/each}
									</div>
								</div>
								<div class="type-list list">
									<h2 class="section-title">Cake Type</h2>
									<div class="effects">
										{#if product.type}
											{#each product.type.split(',') as item}
												<span class="effect-chip">{item.trim()}</span>
											{/each}
										{:else}
											<span class="effect-chip">Unlisted</span>
										{/if}
									</div>
								</div>
							</div>
							<h2 class="section-title">Specifications</h2>
							<SpecTable
								height={product.height}
								duration={product.duration}
								shots={product.shotCount}
							/>
						</div>
					</div>
				</Container>
			</div>
		</div>
	</div>

	{#if lightboxOpen}
		<div class="lightbox-backdrop" on:click={closeLightbox}></div>
		<div class="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
			<button class="lightbox-close" type="button" on:click={closeLightbox}>×</button>
			<button class="lightbox-nav left" type="button" on:click={prevImage}>‹</button>
			<img src={selectedImage.full} alt={`${product.title} full size`} />
			<button class="lightbox-nav right" type="button" on:click={nextImage}>›</button>
		</div>
	{/if}
{/if}

<style lang="scss">
	.product-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2em;
	}
	.image-container {
		display: flex;
		flex-direction: column;
		width: 380px;
		max-width: 100%;
	}
	.gallery {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
		background: var(--grey);
		padding: 0.75em;
	}
	.main-image {
		display: block;
		border: 2px solid var(--grey);
		background: var(--white);
		padding: 0.5em;
		box-shadow: none;
		aspect-ratio: 4 / 3;
		overflow: hidden;
	}
	.main-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.thumbs {
		display: grid;
		grid-template-columns: repeat(auto-fit, 64px);
		gap: 0.4em;
		margin-bottom: 0.5em;
		justify-content: space-around;
		justify-items: center;
	}
	.thumbs button {
		border: 1px solid var(--grey);
		background: var(--white);
		padding: 0.2em;
		cursor: pointer;
		aspect-ratio: 1 / 1;
	}
	.thumbs button.selected {
		outline: 2px solid var(--yellow-accent);
		outline-offset: 1px;
	}
	.thumbs img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.video-frame {
		margin-top: 0.75em;
		aspect-ratio: 16 / 9;
		background: var(--black, #000);
		border: 2px solid var(--grey);
	}
	.video-frame iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}
	.lightbox-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		z-index: 2000;
	}
	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 2010;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.lightbox img {
		max-width: 90vw;
		max-height: 85vh;
		object-fit: contain;
		border: 3px solid var(--white);
		background: var(--black, #000);
	}
	.lightbox-close {
		position: fixed;
		top: 1.5em;
		right: 1.5em;
		width: 44px;
		height: 44px;
		font-size: 2em;
		border: none;
		background: var(--white);
		color: var(--grey);
		cursor: pointer;
		box-shadow: 4px 4px 0 var(--yellow-accent);
		z-index: 2020;
	}
	.lightbox-nav {
		position: fixed;
		top: 50%;
		transform: translateY(-50%);
		width: 48px;
		height: 48px;
		border: none;
		background: var(--white);
		color: var(--grey);
		font-size: 2em;
		cursor: pointer;
		box-shadow: 4px 4px 0 var(--yellow-accent);
		z-index: 2020;
	}
	.lightbox-nav.left {
		left: 1.5em;
	}
	.lightbox-nav.right {
		right: 1.5em;
	}
	.details-container {
		flex: 1 1 420px;
		max-width: 700px;
	}
	.images {
		img {
			max-width: 100%;
		}
	}
	.ribbon {
		font-size: 1.5em;
		position: relative;
		left: -0.75em;
		top: 0.75em;
		z-index: 3;
		transform: rotate(-7deg);
	}
	.color {
		height: 1em;
		width: 1px;
		width: 100%;
		display: inline-block;
		box-shadow: 0px 10px 0px -4px #000000;
	}
	.attributes {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1em;
		@media screen and (max-width: 1024px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		@media screen and (max-width: 700px) {
			grid-template-columns: 1fr;
		}
	}
	.list {
		min-width: 100px;
	}
	.section-title {
		margin: 0 0 0.5em 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.9em;
		color: var(--grey);
		border-bottom: 1px solid var(--grey);
		padding-bottom: 0.3em;
	}
	.description-text {
		line-height: 1.6;
		margin-bottom: 1em;
	}
	.effects {
		display: inline-flex;
		gap: 0.4em;
		flex-wrap: wrap;
	}
	.effect-chip {
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: var(--white);
		color: var(--grey);
		padding: 0.2em 0.5em;
		border-radius: 4px;
		border: 1px solid var(--grey);
	}
	@media screen and (max-width: 1024px) {
		.details-container {
			width: 100%;
		}
		.image-container {
			display: flex;
			flex-direction: column;
			width: 100%;
		}
	}
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
		width: min(86vw, 1100px);
		max-height: calc(100vh - var(--nav-height) - 5em);
		overflow: auto;
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 10px 10px 0 var(--yellow-accent);
		z-index: 2;
		padding: 0;
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
	.modal-actions {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}
	.modal-share {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		background: var(--white);
		color: var(--grey);
		border: none;
		padding: 0.45rem 0.7rem;
		cursor: pointer;
		box-shadow: 3px 3px 0 var(--yellow-accent);
		font-family: Langdon, Arial, sans-serif;
		font-size: 0.95rem;
		text-transform: uppercase;
		line-height: 1;
	}
	.modal-share.copied {
		background: #dff5e4;
		color: #0e5a22;
	}
	.modal-share.error {
		background: #ffe0e0;
		color: #9c1b1b;
	}
	.modal-share-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
	}
	.modal-share-icon svg {
		display: block;
		width: 20px;
		height: 20px;
	}
	.modal-share-label {
		white-space: nowrap;
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
	@media screen and (max-width: 700px) {
		.modal-header {
			align-items: flex-start;
			gap: 0.75rem;
		}
		.modal-header h2 {
			flex: 1 1 auto;
			font-size: 1.15rem;
		}
		.modal-actions {
			flex-direction: column;
			align-items: stretch;
		}
		.modal-share {
			justify-content: center;
			padding-inline: 0.65rem;
		}
	}
</style>
