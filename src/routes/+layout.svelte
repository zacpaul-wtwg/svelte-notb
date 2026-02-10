<script>
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import ProductModal from '$lib/components/ProductModal.svelte';
	import WishlistModal from '$lib/components/WishlistModal.svelte';
	import CompareModal from '$lib/components/CompareModal.svelte';
	import { fallbackAllData } from '$lib/cms/fallback';
	import { page } from '$app/stores';
	import {
		closeAllGlobalModals,
		closeGlobalCompareModal,
		closeGlobalProductModal,
		closeGlobalWishlistModal,
		modalState
	} from '$lib/modal-store';
	import { fetchRuntimeCms } from '$lib/cms/runtime-client';

	let runtimeAllData = null;
	$: allData = runtimeAllData ?? fallbackAllData;
	$: isCmsAdmin = $page.url.pathname.startsWith('/cms-admin');

	onMount(async () => {
		const latest = await fetchRuntimeCms();
		if (latest) runtimeAllData = latest;
	});
</script>

{#if !isCmsAdmin}
	<header>
		<Navbar />
	</header>
{/if}

<main>
	<slot />
</main>

{#if $modalState.product}
	<ProductModal product={$modalState.product} onClose={closeGlobalProductModal} />
{:else if $modalState.productLoading}
	<div class="loading-backdrop">
		<div class="loading-card" role="status" aria-live="polite">Loading product details...</div>
	</div>
{:else if $modalState.productError}
	<div class="loading-backdrop">
		<div class="loading-card error">
			<p>{$modalState.productError}</p>
			<button type="button" on:click={closeAllGlobalModals}>Close</button>
		</div>
	</div>
{/if}

{#if $modalState.wishlistOpen}
	<WishlistModal onClose={closeGlobalWishlistModal} />
{/if}

{#if $modalState.compareOpen && $page.url.pathname !== '/compare'}
	<CompareModal onClose={closeGlobalCompareModal} />
{/if}

{#if !isCmsAdmin}
	<Footer {allData} />
{/if}

<style>
	header {
		height: var(--header);
	}
	main {
		min-height: 75vh;
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
