<script>
	import { slugify } from '$lib/utility/slugify';
	import Ribbon from './ribbon.svelte';
	export let product;

	export const getThumb = function (image) {
		if (image) {
			return image.replace('pos_', 'thumb_');
		}

		return 'product-placeholder.jpg';
	};
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

	$: ribbonColor = getColor(product.deal);
</script>

<section class="card">
	<div class="title">
		<h2>{product.title}</h2>
	</div>
	<div class="ribbon-container">
		<div class="ribbon">
			<h4>
				<Ribbon
					string={`${product.deal} $${product.price}`}
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
	<a sveltekit:prefetch href={`/products/${product.id}/${slugify(product.title)}`} target="_blank">
		link
	</a>
</section>

<style lang="scss">
	.card {
		width: 300px;
		border: solid thin var(--off-white);
		display: block;
	}

	.title {
		background: var(--grey);
		color: var(--white);
		padding: 0em 0.5em;
		min-height: 4em;
		font-weight: 100;
	}

	.image-container {
		position: relative;
		overflow: hidden;
		height: 200px;
		img {
			position: absolute;
			top: -100%;
			left: 0;
			right: 0;
			bottom: -100%;
			margin: auto;
			width: 100%;
			transition: transform 0.5s;
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
</style>
