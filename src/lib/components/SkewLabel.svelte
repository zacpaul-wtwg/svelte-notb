<script>
	export let as = 'div';
	export let text = '';
	export let className = '';
	export let classSide = '';
	export let showRule = false;
</script>

<svelte:element this={as} class={`skew-label ${showRule ? 'with-rule' : ''} ${className}`.trim()}>
	{#if showRule}
		<div class="rule"></div>
	{/if}
	<div class={`internal ${classSide}`.trim()}>
		<div class="deskew"><slot>{text}</slot></div>
	</div>
</svelte:element>

<style>
	.skew-label {
		position: relative;
		display: inline-block;
	}

	.skew-label.with-rule {
		display: block;
		width: 100%;
		min-height: 4.75rem;
		overflow-x: clip;
	}

	.rule {
		position: absolute;
		left: 0;
		right: 0;
		top: 2.5rem;
		height: 2px;
		background-color: black;
	}

	.internal {
		background-color: var(--grey);
		color: white;
		font-family: 'Agency FB', 'AgencyFB', 'Arial Narrow', 'Langdon', Arial, sans-serif;
		padding: 0.35em 0.6em;
		transform: skew(-14deg);
		display: inline-block;
		border-radius: 5px;
		box-shadow: 5px 5px rgb(186, 201, 38);
		font-size: 1rem;
		max-width: 100%;
	}

	.with-rule > .internal {
		position: absolute;
		left: -50px;
		top: 0;
		width: min(30%, 420px);
		font-size: 2rem;
		padding: 7px;
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

	@media (max-width: 700px) {
		.with-rule > .internal {
			left: -24px;
			width: min(70%, 460px);
			font-size: clamp(1.4rem, 7vw, 2rem);
		}
	}
</style>
