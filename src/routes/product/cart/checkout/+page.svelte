<script>
	import { goto } from '$app/navigation';
	import WishlistModal from '$lib/components/WishlistModal.svelte';

	export let data;
</script>

<WishlistModal allData={data?.allData} onClose={() => goto('/product')} mode="checkout" backHref="/product/cart" />
