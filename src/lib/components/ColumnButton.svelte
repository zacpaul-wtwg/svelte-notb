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
	button {
		color: var(--white);
		text-decoration: none;
		padding: 0.5em 2em 0.5em 2em;
		margin-top: 25px;
		font-family: Langdon;
		text-transform: uppercase;
		font-size: 2em;
		transition: 0.4s;
		box-shadow: inset 0px 0px 0px 5px rgb(255, 255, 255);
		background: var(--grey);
		cursor: pointer;
		display: block;
	}
	button:hover {
		color: var(--white);
		background-color: var(--grey);
		box-shadow: none;
	}
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
