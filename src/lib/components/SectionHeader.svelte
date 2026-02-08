<script>
	export let text = '';
	export let side = 'left'; // left | right
	export let as = 'h2';
	export let className = '';
</script>

<div class={`section-header side-${side} ${className}`.trim()}>
	<svelte:element this={as} class="label">
		<span><slot>{text}</slot></span>
	</svelte:element>
</div>

<style>
	.section-header {
		position: relative;
		width: 100vw;
		margin-left: calc(50% - 50vw);
		display: flex;
		padding: 0 1rem;
		box-sizing: border-box;
		overflow-x: clip;
		margin-top: 0;
		margin-bottom: 0;
	}

	.section-header.side-left {
		justify-content: flex-start;
	}

	.section-header.side-right {
		justify-content: flex-end;
	}

	.label {
		margin: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		transform: skew(-14deg);
		padding: 0.32rem 0.9rem;
		font-family: Langdon, Arial, sans-serif;
		font-size: clamp(1.15rem, 2.1vw, 1.75rem);
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
