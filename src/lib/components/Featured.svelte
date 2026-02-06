<script>
	//page settings
	export const intervalBetweenChange = 4000;

	export let productsData;
	import { blur } from 'svelte/transition';
	import { getThumb } from '$lib/utility/imageThumb';
	import Article from '$lib/components/Article.svelte';
	import ShortenSentence from '$lib/utility/ShortenSentence.svelte';
	import { slugify } from '$lib/utility/slugify';

	export const sortedProducts = (productsData?.products ?? []).filter((x) => x.featured === 'yes');
	export const productIdArray = sortedProducts.map((x) => x.id);
	$: itemCount = sortedProducts.length;
	$: haltRiffle = false;
	$: arrayRiffle = 0;
	$: selectedId = productIdArray[arrayRiffle];
	export let h;

	setInterval(() => {
		if (haltRiffle === false) {
			arrayRiffle !== sortedProducts.length - 1 ? arrayRiffle++ : (arrayRiffle = 0);
		} else {
			arrayRiffle == arrayRiffle;
		}
	}, intervalBetweenChange);

	const month = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const d = new Date();
	let monthName = month[d.getMonth()];
</script>

<!-- {#each productIdArray as id}
	<div class="selector">
		<input type="radio" value={id} name="ids" bind:group={selectedId} />
		<label for={id}>{id}</label>
	</div>
{/each} -->
<div
	class="article-container"
	on:mouseenter={() => (haltRiffle = true)}
	on:mouseleave={() => (haltRiffle = false)}
	role="group"
>
	<Article title={'Monthly Featured Items'} date={monthName}>
		<div class="carousel-container">
			<div class="item" style="height: {h}px;">
				{#each sortedProducts as product}
					{#if product.id === selectedId}
						<div class="content" transition:blur bind:clientHeight={h}>
							<div aria-live="polite" aria-atomic="true" class="liveregion">
								Item {arrayRiffle} of {itemCount}, product {product.title}
							</div>
							<div class="left-content">
								<div class="image-container">
									<img src={getThumb(product.imageThumb)} alt="featured product {product.title}" />
								</div>
								<div class="buttons">
									<button
										class="riffle-left riffle"
										on:click={(x) => (0 !== arrayRiffle ? arrayRiffle-- : arrayRiffle)}
									>
										<img src="arrow-left.svg" alt="left arrow icon" class="svg-filter-white" />
									</button>
									<button
										class="riffle-right riffle"
										on:click={(x) =>
											sortedProducts.length - 1 !== arrayRiffle ? arrayRiffle++ : arrayRiffle}
									>
										<img src="arrow-right.svg" alt="left arrow icon" class="svg-filter-white" />
									</button>
								</div>
							</div>
							<div class="sub-content">
								<h3 class="title">{product.title}</h3>
								<h4>department: {product.category}</h4>
								<p class="description">
									<ShortenSentence string={product.description}>...</ShortenSentence> <br />
								</p>
								<p>
									<a href={`/product/${product.id}/${slugify(product.title)}`} target="_blank">
										READ MORE ABOUT {product.title}
									</a>
								</p>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</Article>
</div>

<style lang="scss">
	.article-container {
		background: var(--off-white);
		padding: 2em;
		border: solid 1px var(--grey);
	}
	.carousel-container {
		display: flex;
		width: 100%;
	}
	.content {
		position: absolute;
		display: flex;
		width: 100%;
	}
	.sub-content {
		width: 50%;
		margin: 0em 1em;
	}
	.item {
		position: relative;
		width: 100%;
	}
	.title {
		background: var(--grey);
		color: var(--white);
		padding: 0.5em 1em;
		margin-bottom: 0.5em;
		display: inline-block;
	}
	.image-container {
		display: inline-block;
		overflow: hidden;
		height: 500px;
		width: 400px;
		height: 300px;
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
	.riffle {
		background: var(--grey);
		width: 3em;
		cursor: pointer;
		height: 4em;
		margin: 1em 0em;
		border-width: 0px;
	}
	.riffle-left {
		border-radius: 10px 0 0 10px;
	}
	.riffle-right {
		border-radius: 0 10px 10px 0;
	}
	.liveregion {
		visibility: hidden;
		height: 0px;
		width: 0px;
	}
	@media screen and (max-width: 980px) {
		.content {
			flex-direction: column;
		}
		.image-container {
			display: inline-block;
			overflow: hidden;
			height: 500px;
			width: 100%;
			height: 300px;
		}
		.sub-content {
			width: 100%;
			padding: none;
			margin: 0em;
		}
		.buttons {
			display: flex;
			align-content: center;
			justify-content: space-around;
		}
		.title {
			display: inline-block;
			width: calc(100% - 2em);
		}
	}
</style>
