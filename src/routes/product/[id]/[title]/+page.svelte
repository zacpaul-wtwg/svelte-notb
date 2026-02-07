<script>
	import { goto } from '$app/navigation';
	import ProductModal from '$lib/components/ProductModal.svelte';

	export let data;
	$: product = data?.product;
</script>

{#if product}
	<ProductModal {product} onClose={() => goto('/product')} />
{/if}
