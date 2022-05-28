<script>
	export let toggle = false;
	export let title;
</script>

<button
	class={!toggle ? 'column-selector hide' : 'show column-selector'}
	on:click={() => {
		toggle = !toggle;
	}}
>
	<span class={toggle ? 'hide' : 'show'}>add<br /></span>
	<span class={!toggle ? 'hide' : 'show'}>remove<br /></span>
	{title}
</button>

<style>
	.column-selector {
		font-size: 1em;
		font-family: sans-serif;
		border: none;
		display: inline-block;
	}

	span.hide {
		display: none;
	}

	button.show {
		background-color: var(--red);
		border: 0.25em solid var(--red);
		margin: 0.75em;
	}

	button {
		margin: 1em;
		transition: ease 0s;
	}
</style>
