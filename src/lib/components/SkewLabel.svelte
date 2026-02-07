<script>
	export let as = 'div';
	export let text = '';
	export let className = '';
</script>

<svelte:element this={as} class={`skew-label ${className}`.trim()}>
	<span><slot>{text}</slot></span>
</svelte:element>

<style>
	.skew-label {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4em 1em;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--grey);
		box-shadow: 4px 4px 0 var(--yellow-accent);
		transform: skew(-14deg);
		border-radius: 0 6px 6px 0;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		line-height: 1.1;
	}

	.skew-label > span {
		display: inline-block;
		transform: skew(14deg);
		color: var(--white);
		position: relative;
		z-index: 1;
	}
</style>
