<script>
	export let text = '';
	export let as = 'h2';
	export let className = '';
	export let labelX = '50%';
</script>

<div class={`section-header ${className}`.trim()} style={`--label-x:${labelX}`}>
	<div class="edge-line edge-line-left" aria-hidden="true"></div>
	<svelte:element this={as} class="label">
		<span><slot>{text}</slot></span>
	</svelte:element>
	<div class="edge-line edge-line-right" aria-hidden="true"></div>
</div>

<style>
	.section-header {
		width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: 0;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		padding: 0 1rem;
		box-sizing: border-box;
		overflow: hidden;
		position: relative;
		min-height: 64px;
	}

	.edge-line {
		position: absolute;
		width: 1400px;
		height: 2px;
		background: var(--grey);
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}

	.edge-line-left {
		left: 20px;
		top: 24px;
	}

	.edge-line-right {
		right: 20px;
		top: -16px;
	}

	.label {
		display: inline-block;
		position: absolute;
		left: var(--label-x);
		top: 0;
		margin: 0;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		transform: translateX(-50%) skew(-14deg);
		padding: 0.32rem 0.9rem;
		font-family: Langdon, Arial, sans-serif;
		font-size: clamp(1.72rem, 3.15vw, 2.62rem);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		max-width: 100%;
		box-sizing: border-box;
	}

	.label span {
		display: block;
		transform: skew(14deg);
	}

	@media (max-width: 700px) {
		.section-header {
			padding: 0 0.75rem;
		}
	}
</style>
