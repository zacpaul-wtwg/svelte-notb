<script>
	import HomeNews from '$lib/components/HomeNews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import FeaturedCarousel from '$lib/components/FeaturedCarousel.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
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
<SectionHeader id="home-latest-news-label" text="Latest News" place={0} />
<Container>
	<section class="home-content-stack">
		<section class="home-body">
			<HomeNews {allData} />
		</section>
		<section class="home-body">
			<FeaturedCarousel products={featuredProducts} intervalMs={5000} />
		</section>
	</section>
</Container>

<style>
	.home-content-stack {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.home-body {
		width: 100%;
	}
</style>
