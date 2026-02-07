<script>
	import HomeNews from '$lib/components/HomeNews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import { isFeaturedProduct } from '$lib/filter-utils';

	export let data;
	$: allData = data?.allData;
	$: productsData = data?.productsData?.things ?? { products: [] };
	$: allProducts = productsData?.products ?? [];

	$: featuredProducts = allProducts.filter((product) => isFeaturedProduct(product));

	let carouselEl;
	const scrollByCards = 2;
	const cardWidth = 300;
	const cardGap = 16;
	const scrollAmount = scrollByCards * (cardWidth + cardGap);

	const scrollFeatured = (direction) => {
		if (!carouselEl) return;
		carouselEl.scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth'
		});
	};
</script>

<svelte:head>
	<title>North of the Border Fireworks</title>
	<meta
		name="description"
		content="NOTB Fireworks is a leading fireworks Retailer and Warehouse in the Pocono's Lake Wallenpaupack region. We offer both Retail and Case-Lot options. Whether your need is casual, enthusiast, or professsional, we have the right stock and the right pricing structure to meet your needs."
	/>
</svelte:head>
<Hero {allData} />
<Container>
	<HomeNews {allData} />
	<section class="featured-products">
		<div class="featured-header">
			<h2>Featured Fireworks</h2>
			<div class="controls">
				<button type="button" class="nav-button" on:click={() => scrollFeatured('left')}>
					Prev
				</button>
				<button type="button" class="nav-button" on:click={() => scrollFeatured('right')}>
					Next
				</button>
			</div>
		</div>

		{#if featuredProducts.length > 0}
			<div class="featured-carousel" bind:this={carouselEl}>
				{#each featuredProducts as product (product.id)}
					<div class="featured-item">
						<ProductCard {product} />
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty-state">No featured products are currently marked in Comcash.</p>
		{/if}
	</section>
</Container>

<style>
	.featured-products {
		margin: 2rem 0 3rem;
	}
	.featured-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}
	.featured-header h2 {
		margin: 0;
	}
	.controls {
		display: flex;
		gap: 0.5rem;
	}
	.nav-button {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		padding: 0.45rem 0.7rem;
		cursor: pointer;
		font-weight: 700;
	}
	.featured-carousel {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		padding: 0.4rem 0.2rem 1rem;
		scroll-snap-type: x mandatory;
	}
	.featured-item {
		flex: 0 0 auto;
		scroll-snap-align: start;
	}
	.empty-state {
		margin: 0.25rem 0 0;
		color: var(--grey);
	}
	@media (max-width: 700px) {
		.featured-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
