<script>
	export let variant = 'default';
</script>

<button type="submit" class:nav-pill={variant === 'nav'} on:click>
	<span class="label"><slot /></span>
</button>

<style>
	button {
		color: var(--white);
		text-decoration: none;
		padding: 0.5em 2em 0.5em 2em;
		font-family: Langdon;
		text-transform: uppercase;
		font-size: 2em;
		transition: 0.4s;
		box-shadow: inset 0px 0px 0px 5px rgb(255, 255, 255);
		background: var(--grey);
		cursor: pointer;
		display: inline-block;
		margin: 0;
	}
	.label {
		display: inline-block;
	}
	button:hover {
		color: var(--white);
		background-color: var(--grey);
		box-shadow: none;
	}
	button.nav-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 30px;
		padding: 0 0.62rem;
		margin: 0;
		font-size: 1.2rem;
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		box-shadow: 2px 2px 0 var(--yellow-accent);
		transform: skew(-14deg);
	}
	button.nav-pill .label {
		transform: skew(14deg);
	}
	button.nav-pill:hover {
		color: var(--grey);
		background: var(--white);
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
</style>
