<script>
	import PageTitle from './PageTitle.svelte';

	export let title = 'North of the Border Fireworks';
</script>

<PageTitle pageTitle={title} />
<div>
	<div>
		<h1>
			{title}
		</h1>
	</div>
</div>

<style lang="scss">
	div {
		width: 100%;
		background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero-bg.jpg') center;
		color: var(--white);
		display: flex;
		justify-content: center;
		padding-bottom: 0.5em;
		margin-top: -1em;

		div {
			max-width: 1024px;
			display: block;
			padding: 2em;
		}
	}
	h1 {
		transform: rotate(-7deg);
		background: var(--grey);
		display: inline-block;
		padding: 0.25em 1em 0 1em;
		position: relative;
		top: 50px;
	}
</style>
