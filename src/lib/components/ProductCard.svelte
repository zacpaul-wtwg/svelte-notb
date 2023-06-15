<script>
	// #region imports
	import { slugify } from '$lib/utility/slugify';
	import Ribbon from './ribbon.svelte';
	import { getThumb } from '$lib/utility/imageThumb';
	import { sentenceify } from '$lib/utility/slugify';
	import ShortenSentence from '$lib/utility/ShortenSentence.svelte';
	import Clickers from './Clickers.svelte';
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
	// #endregion
</script>

<section class="card">
	<a href={`/product/${id}/${slugify(title)}`} target="_blank">
		<div class="title">
			<h2>{title}</h2>
		</div>
		<div class="ribbon-container">
			<div class="ribbon">
				<h3>
					<Ribbon
						string={`${deal} $${price}`}
						bgColor={ribbonColor.bg}
						fontColor={ribbonColor.text}
						padding={'.5'}
					/>
				</h3>
			</div>
		</div>

		<div class="image-container">
			<img loading="lazy" src={getThumb(imageThumb)} alt="{sentenceify(title)} product" />
		</div>
	</a>
	<h4>{category}</h4>
	{#if description === undefined}
		<p>
			We just added this bad-boy and there's not a description for it yet! Don't worry, we will get
			some good sentences down on this ASAP!
		</p>
	{:else}
		<p>
			<ShortenSentence string={description}>...</ShortenSentence>
		</p>
	{/if}
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
