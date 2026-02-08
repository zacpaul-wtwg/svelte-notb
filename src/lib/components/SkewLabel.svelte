<script>
	export let as = 'div';
	export let text = '';
	export let className = '';
	export let classSide = '';
</script>

<svelte:element this={as} class={`skew-label ${className}`.trim()}>
	<div class="rule"></div>
	<div class={`internal ${classSide}`.trim()}>
		<div class="deskew"><slot>{text}</slot></div>
	</div>
</svelte:element>

<style>
	.rule {
		position: absolute;
		width: 100%;
		height: 2px;
		background-color: black;
		margin-top: 40px;
		width: 100%;
		right: -33%;
	}
	.skew-label {
		margin-bottom: 80px;
	}
	.internal {
		background-color: var(--grey);
		color: white;
		font-family: 'Agency FB', 'AgencyFB', 'Arial Narrow', 'Langdon', Arial, sans-serif;
		padding: 7px;
		transform: skew(-14deg);
		position: absolute;
		left: -50px;
		width: 30%;
		border-radius: 5px;
		box-shadow: 5px 5px rgb(186, 201, 38);
		font-size: 2rem;
	}
	.left {
		padding-left: 60px;
		padding-right: 10px;
		text-align: right;
	}

	.deskew {
		transform: skew(14deg);
		width: auto;
	}
</style>
