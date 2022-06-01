<script>
	export let title;
	export let date;
</script>

<div>
	<div>
		<h2>{title}</h2>
		<em>{date}</em>
	</div>
	<slot />
</div>

<style lang="scss">
	div > div {
		transform: rotate(-7deg);
		background: var(--grey);
		display: inline-flex;
		padding: 0.25em 1em 0 1em;
		position: relative;
		left: -1em;
		color: var(--white);
		flex-direction: column;
		align-items: flex-end;
		h2 {
			line-height: 1em;
		}
	}
</style>
