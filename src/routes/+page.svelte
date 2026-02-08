<script>
	import HomeNews from '$lib/components/HomeNews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import FeaturedCarousel from '$lib/components/FeaturedCarousel.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import SkewLabel from '$lib/components/SkewLabel.svelte';
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
	<svelte:fragment slot="section-label">
		<div class="home-label-layer">
			<SkewLabel as="div" text="Latest" className="home-edge-pill" classSide="left" showRule />
		</div>
	</svelte:fragment>
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
	.home-label-layer {
		width: 100%;
		overflow-x: clip;
		margin-bottom: 0.4rem;
	}

	.home-content-stack {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.home-body {
		width: 100%;
	}

	.home-label-layer :global(.home-edge-pill) {
		font-family: 'Agency FB', 'AgencyFB', 'Arial Narrow', 'Langdon', Arial, sans-serif;
		line-height: 0.95;
		letter-spacing: 0.06em;
		white-space: nowrap;
		max-width: none;
	}

	.home-label-layer :global(.home-edge-pill.from-left) {
		justify-content: flex-end;
		text-align: right;
		animation: slide-in-left 420ms ease-out;
	}

	.home-label-layer :global(.home-edge-pill.from-right) {
		justify-content: flex-start;
		text-align: left;
		animation: slide-in-right 420ms ease-out;
	}

	@keyframes slide-in-left {
		from {
			transform: translateX(-22px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slide-in-right {
		from {
			transform: translateX(22px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
