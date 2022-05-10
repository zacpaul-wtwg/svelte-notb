<script>
	export let destination;
	export let label;
</script>

<a href={destination}>
	{label}
</a>

<style>
	a,
	a:visited {
		background-color: var(--grey);
		color: white;
		text-decoration: none;
		padding: 1em 2em 1em 2em;
		margin-top: 25px;
		font-family: Langdon;
		text-transform: uppercase;
		font-size: 2em;
		transition: 0.4s;
		box-shadow: inset 0px 0px 0px 5px rgb(255, 255, 255);
		background-color: rgb(255, 255, 255, 0);
	}
	a:hover {
		background-color: var(--grey);
		box-shadow: none;
	}
</style>
