<script>
	export let text = '';
	export let side = 'left'; // left | right
	export let as = 'h2';
	export let className = '';
</script>

<div class={`section-header side-${side} ${className}`.trim()}>
	<span class="edge-line" aria-hidden="true"></span>
	<svelte:element this={as} class="label">
		<span><slot>{text}</slot></span>
	</svelte:element>
</div>

<style>
	.section-header {
		--section-max: 1024px;
		--section-pad: 1rem;
		--content-edge: max(calc((100vw - var(--section-max)) / 2 + var(--section-pad)), var(--section-pad));
		--label-offset: var(--section-pad);
		position: relative;
		width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: 0;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		display: flex;
		padding: 0 var(--section-pad);
		box-sizing: border-box;
		overflow-x: clip;
	}

	.section-header.side-left {
		justify-content: flex-start;
	}

	.section-header.side-right {
		justify-content: flex-end;
	}

	.edge-line {
		display: none;
	}

	.section-header.side-left .edge-line {
		display: block;
		position: absolute;
		left: 0;
		top: 50%;
		width: var(--label-offset);
		height: 2px;
		background: var(--grey);
		box-shadow: 3px 3px 0 var(--yellow-accent);
		transform: translateY(-50%);
	}

	.section-header.side-left .label {
		margin-left: var(--label-offset);
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
			--section-pad: 0.75rem;
			padding: 0 var(--section-pad);
		}
	}

	@media (min-width: 1025px) {
		.section-header {
			--label-offset: calc(var(--content-edge) + (var(--section-max) * 0.2));
		}
	}
</style>
