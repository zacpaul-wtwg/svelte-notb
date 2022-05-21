<script>
	import { slugify } from '$lib/utility/slugify';
	import Ribbon from './ribbon.svelte';
	import { getThumb } from '$lib/utility/imageThumb';
	import { goto, prefetch, prefetchRoutes } from '$app/navigation';
	export let product;

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

	export const goToProduct = function (link) {
		return (window.location = link);
	};

	$: link = `/products/${product.id}/${slugify(product.title)}`;
	$: ribbonColor = getColor(product.deal);
</script>

<section class="card" on:click={goToProduct(link)}>
	<a href={`/products/${product.id}/${slugify(product.title)}`} target="_blank">
		<div class="title">
			<h2>{product.title}</h2>
		</div>
	</a>
	<div class="ribbon-container">
		<div class="ribbon">
			<h4>
				<Ribbon
					string={`${product.deal} $${product.price.toFixed(2)}`}
					bgColor={ribbonColor.bg}
					fontColor={ribbonColor.text}
					padding={'.5'}
				/>
			</h4>
		</div>
	</div>

	<div class="image-container">
		<img src={getThumb(product.imageThumb)} alt="{product.title} IMAGE" />
	</div>
	<h3>{product.category}</h3>
	<p>{product.description}</p>
</section>

<style lang="scss">
	.card {
		width: 300px;
		border: solid thin var(--off-white);
		display: block;
		position: relative;
		z-index: 3;
		cursor: pointer;
	}

	.title {
		background: var(--grey);
		color: var(--white);
		padding: 0em 0.5em;
		min-height: 4em;
		font-weight: 100;
	}

	.image-container {
		overflow: hidden;
		height: 200px;
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
		position: relative;
	}
	.ribbon {
		transform: rotate(-10deg);
		font-size: 1.25em;
		right: -1em;
		top: -1em;
		position: absolute;
		z-index: 2;
	}
	a {
		text-decoration: none;
	}
</style>
