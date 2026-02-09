<script>
	import { goto } from '$app/navigation';
	import CompareModal from '$lib/components/CompareModal.svelte';

	export let data;

	const closeCompare = () => goto('/product');
</script>

<CompareModal products={data?.products ?? []} onClose={closeCompare} />
