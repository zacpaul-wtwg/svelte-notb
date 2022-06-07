<script>
	import { slugify } from '$lib/utility/slugify';
	import Ribbon from './ribbon.svelte';
	import { getThumb } from '$lib/utility/imageThumb';
	import { sentenceify } from '$lib/utility/slugify';
	import ShortenSentence from '$lib/utility/ShortenSentence.svelte';
	import Clickers from './Clickers.svelte';
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

	$: ribbonColor = getColor(product.deal);
</script>

<section class="card">
	<a href={`/product/${product.id}/${slugify(product.title)}`} target="_blank">
		<div class="title">
			<h2>{product.title}</h2>
		</div>
		<div class="ribbon-container">
			<div class="ribbon">
				<h3>
					<Ribbon
						string={`${product.deal} $${product.price.toFixed(2)}`}
						bgColor={ribbonColor.bg}
						fontColor={ribbonColor.text}
						padding={'.5'}
					/>
				</h3>
			</div>
		</div>

		<div class="image-container">
			<img src={getThumb(product.imageThumb)} alt="{sentenceify(product.title)} product" />
		</div>
	</a>
	<h4>{product.category}</h4>
	<p>
		<ShortenSentence string={product.description}>...</ShortenSentence>
	</p>
	<Clickers {product} />
</section>

<style lang="scss">
	.card {
		width: 300px;
		border: solid thin var(--off-white);
		display: block;
		position: relative;
		z-index: 3;
		padding-bottom: 5em;
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
