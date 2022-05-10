<script>
	import PageTitle from '$lib/components/PageTitle.svelte';

	export let product;
</script>

<PageTitle pageTitle={product.title} />

<div>
	<h1>{product.title}</h1>
	<p>{product.description}</p>
</div>
