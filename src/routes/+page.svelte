<script>
	import HomeNews from '$lib/components/HomeNews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import FeaturedCarousel from '$lib/components/FeaturedCarousel.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import { isFeaturedProduct } from '$lib/filter-utils';

	export let data;
	$: allData = data?.allData;
	$: productsData = data?.productsData?.things ?? { products: [] };
	$: allProducts = productsData?.products ?? [];
	$: featuredProducts = allProducts.filter((product) => isFeaturedProduct(product));
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
	<section class="page-stack home-stack">
		<div class="home-section">
			<HomeNews {allData} />
		</div>
		<div class="home-section">
			<FeaturedCarousel products={featuredProducts} intervalMs={5000} />
		</div>
	</section>
</Container>

<style>
	.home-section {
		width: 100%;
	}
</style>
