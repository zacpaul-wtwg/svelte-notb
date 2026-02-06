<script>
	import ProductPage from '$lib/components/ProductPage.svelte';
	export let data;
	$: products = data?.products ?? [];
	$: availableFilters = data?.availableFilters ?? {};
	$: departments = data?.departments ?? [];
</script>

<ProductPage {products} {availableFilters} {departments} />
<slot />
