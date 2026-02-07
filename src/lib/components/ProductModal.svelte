<script>
	import Container from '$lib/components/elements/Container.svelte';
	import ColorDots from '$lib/components/ColorDots.svelte';
	import Ribbon from '$lib/components/ribbon.svelte';
	import SpecTable from '$lib/components/SpecTable.svelte';

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
</script>

{#if product}
	<svelte:window on:keydown={handleKey} />
	<div class="modal-page">
		<div class="modal-frame">
			<div class="modal-backdrop" on:click={onClose}></div>
			<div class="modal" role="dialog" aria-modal="true" aria-label="Product details">
				<div class="modal-header">
					<h2>{product.title}</h2>
					<button class="modal-close" type="button" on:click={onClose}>×</button>
				</div>
				<Container>
					<div class="product-container">
						<div class="image-container">
							<div class="ribbon-container">
								{#if product.brand === '2 FOR'}
									<h3 class="ribbon">
										<Ribbon
											bgColor={'red'}
											fontColor={'white'}
											padding={'1'}
											string={`${product.brand} $${product.price}`}
										/>
									</h3>
								{:else}
									<h3 class="ribbon">
										<Ribbon
											bgColor={'yellow'}
											fontColor={'grey'}
											padding={'1'}
											string={`${product.brand} $${product.price}`}
										/>
									</h3>
								{/if}
							</div>
							{#if !hasImages}
								<div class="images">
									<img src={'/product-placeholder.jpg'} alt={`${product.title} placeholder image`} />
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
		@media screen and (max-width: 900px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		@media screen and (max-width: 520px) {
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
	@media screen and (max-width: 968px) {
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
</style>
