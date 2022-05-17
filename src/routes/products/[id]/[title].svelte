<script context="module">
	export const prerender = false;
</script>

<script>
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';

	export let product;
</script>

<TitleBar title={product.title} />
<Container>
	<div class="product-container">
		<div class="image-container">
			{#each product.images as image}
				<div class="images">
					<img src={image.full} alt={`${product.title} ${image.title}`} />
				</div>
			{/each}
		</div>
		<div class="details-container">
			<h2>Department: {product.category}</h2>
			<h2>Description</h2>
			<p>{product.description}</p>
		</div>
	</div>
</Container>

<style lang="scss">
	.product-container {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-around;
		align-items: flex-start;
	}
	.image-container {
		display: flex;
		flex-direction: column;
		width: 35%;
	}
	.details-container {
		width: 55%;
	}
	.images {
		img {
			max-width: 100%;
		}
	}
</style>
