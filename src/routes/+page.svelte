<script>
	import HomeNews from '$lib/components/HomeNews.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import FeaturedCarousel from '$lib/components/FeaturedCarousel.svelte';
	import ProductModal from '$lib/components/ProductModal.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import { isFeaturedProduct } from '$lib/filter-utils';

	export let data;
	$: allData = data?.allData;
	$: productsData = data?.productsData?.things ?? { products: [] };
	$: allProducts = productsData?.products ?? [];
	$: featuredProducts = allProducts.filter((product) => isFeaturedProduct(product));

	let selectedProduct = null;
	let productModalLoading = false;
	let productModalError = '';

	const closeProductModal = () => {
		selectedProduct = null;
		productModalLoading = false;
		productModalError = '';
	};

	const openProductModal = async (product) => {
		if (!product?.id) return;
		productModalLoading = true;
		productModalError = '';
		selectedProduct = null;
		try {
			const response = await fetch(`/data/product/${product.id}`);
			const payload = await response.json();
			if (!response.ok || !payload?.product) {
				throw new Error(payload?.error ?? 'Failed to load product details.');
			}
			selectedProduct = payload.product;
		} catch (error) {
			productModalError = error?.message ?? 'Failed to load product details.';
		} finally {
			productModalLoading = false;
		}
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
	<section class="page-stack home-stack">
		<div class="home-section">
			<HomeNews {allData} />
		</div>
		<div class="home-section">
			<FeaturedCarousel
				products={featuredProducts}
				intervalMs={5000}
				on:openproduct={(event) => openProductModal(event.detail.product)}
			/>
		</div>
	</section>
</Container>

{#if selectedProduct}
	<ProductModal product={selectedProduct} onClose={closeProductModal} />
{:else if productModalLoading}
	<div class="loading-backdrop">
		<div class="loading-card" role="status" aria-live="polite">Loading product details...</div>
	</div>
{:else if productModalError}
	<div class="loading-backdrop">
		<div class="loading-card error">
			<p>{productModalError}</p>
			<button type="button" on:click={closeProductModal}>Close</button>
		</div>
	</div>
{/if}

<style>
	.home-section {
		width: 100%;
	}

	.loading-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1200;
	}

	.loading-card {
		background: var(--white);
		color: var(--grey);
		padding: 1rem 1.2rem;
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		font-weight: 700;
	}

	.loading-card.error {
		max-width: min(90vw, 420px);
	}

	.loading-card.error p {
		margin: 0 0 0.75rem 0;
	}

	.loading-card.error button {
		border: 1px solid var(--grey);
		background: var(--grey);
		color: var(--white);
		padding: 0.45rem 0.75rem;
		cursor: pointer;
	}
</style>
