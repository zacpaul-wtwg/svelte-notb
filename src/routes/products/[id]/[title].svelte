<script context="module">
	export const prerender = false;
</script>

<script>
	import Container from '$lib/components/elements/Container.svelte';
	import Ribbon from '$lib/components/ribbon.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { each } from 'svelte/internal';

	export let product;
	export let colorsArray = product.colors.split(' ');
	export let effectsArray = product.effects.split(' ');
	export let soundsArray = product.sounds.split(' ');
</script>

<TitleBar title={product.title} subtitle={`Department: ${product.category}`} />
<Container>
	<div class="product-container">
		<div class="image-container">
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
		</div>
		<div class="details-container">
			<div class="ribbon-container">
				{#if product.brand === '2 FOR'}
					<h3 class="ribbon">
						<Ribbon bgColor={'red'} fontColor={'white'} padding={'1'} string={`${product.price}`} />
					</h3>
				{:else}
					<h3 class="ribbon">
						<Ribbon bgColor={'red'} fontColor={'white'} padding={'1'} string={`${product.price}`} />
					</h3>
				{/if}
			</div>
			<h2>Description:</h2>
			<p>{product.description}</p>
			<div class="attributes">
				<div class="colors-list">
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
				<div class="effects-list">
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
				<div class="sounds-list">
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
		left: -5em;
		top: -1em;
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
	}
</style>
