<script>
	export let product;
</script>

<svelte:head>
	<title>{product.title} | NOTB Fireworks</title>
</svelte:head>
<div>
	<h1>{product.title}</h1>
	<p>{product.description}</p>
</div>
