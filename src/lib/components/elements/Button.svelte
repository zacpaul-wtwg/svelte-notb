<button type="submit" on:click>
	<slot />
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
	button:hover {
		color: var(--white);
		background-color: var(--grey);
		box-shadow: none;
	}
</style>
