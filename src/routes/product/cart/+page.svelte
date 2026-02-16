<script>
	import { goto } from '$app/navigation';
	import WishlistModal from '$lib/components/WishlistModal.svelte';
</script>

<WishlistModal onClose={() => goto('/product')} mode="list" checkoutHref="/product/cart/checkout" />
