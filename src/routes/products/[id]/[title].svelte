<script context="module">
	export const prerender = false;
</script>

<script>
	import Container from '$lib/components/elements/Container.svelte';
	import Ribbon from '$lib/components/ribbon.svelte';
	import SpecTable from '$lib/components/SpecTable.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { slugify } from '$lib/utility/slugify';
	import { stringify } from 'postcss';
	import { loadSchema } from './schema';

	export let product;
	export let colorsArray = product.colors.split(' ');
	export let effectsArray = product.effects.split(' ');
	export let soundsArray = product.sounds.split(' ');

	export const schema = `{
		"@context": "https://schema.org/",
		"@type": "Product",
		"name": "${product.title.replace('"', 'INCH')}",
		"description": "${product.description}",
		"offers": {
			"@type": "Offer",
			"url": "https://notbfireworks.com/products/${product.id}/${slugify(product.title)}",
			"priceCurrency": "USD",
			"price": "${product.price}",
			"itemCondition": "https://schema.org/NewCondition",
			"availability": "https://schema.org/InStock"
		}
	}`;
</script>

<TitleBar
	title={product.title}
	subtitle={`Department: ${product.category}`}
	description={product.description}
/>
<svelte:head>
	{@html loadSchema(schema)}
</svelte:head>
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
			{#if product.images.length < 1}
				<div class="images">
					<img src={'/product-placeholder.jpg'} alt={`${product.title} placeholder image`} />
				</div>
			{:else}
				{#each product.images as image}
					<div class="images">
						<img
							src={image.full.replace('products/', 'products/thumb_')}
							alt={`${product.title} ${image.title}`}
						/>
					</div>
				{/each}
			{/if}
			<iframe
				src="https://www.youtube.com/embed/{product.youtubeId}?autoplay=1&mute=1"
				allowfullscreen
				title="youtube video of {product.title}"
			/>
		</div>
		<div class="details-container">
			<h2>Description:</h2>
			<p>{product.description}</p>
			<div class="attributes">
				<div class="colors-list list">
					<h2>Colors:</h2>
					<ul>
						{#each colorsArray as color}
							<li>
								<div class="color" style="background: {color}; width: 2em;" />
								<strong>
									{color}
								</strong>
							</li>
							<br />
						{/each}
					</ul>
				</div>
				<div class="effects-list list">
					<h2>Effects:</h2>
					<ul>
						{#each effectsArray as effect}
							<li>
								<strong>
									{effect}
								</strong>
							</li>
							<br />
						{/each}
					</ul>
				</div>
				<div class="sounds-list list">
					<h2>Sounds:</h2>
					<ul>
						{#each soundsArray as sound}
							<li>
								<strong>
									{sound}
								</strong>
							</li>
							<br />
						{/each}
					</ul>
				</div>
			</div>
			<h2>Specifications:</h2>
			<SpecTable
				height={product.height}
				duration={product.duration}
				type={product.type}
				shots={product.shotCount}
			/>
		</div>
	</div>
</Container>

<style lang="scss">
	.product-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-around;
		align-items: flex-start;
	}
	.image-container {
		display: flex;
		flex-direction: column;
		width: 350px;
	}
	.details-container {
		width: 55%;
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
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-evenly;
		align-items: flex-start;
		@media screen and (max-width: 370px) {
			flex-direction: column;
		}
	}
	.list {
		min-width: 100px;
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
</style>
