<script>
	import ProductPage from '$lib/components/ProductPage.svelte';
	import { page } from '$app/stores';
	export let data;
	$: products = data?.products ?? [];
	$: availableFilters = data?.availableFilters ?? {};
	$: departments = data?.departments ?? [];
	$: isProductIndex = $page.url.pathname === '/product' || $page.url.pathname === '/product/';
</script>

{#if isProductIndex}
	<ProductPage {products} {availableFilters} {departments} />
{/if}
<slot />
