<script>
	import PageTitle from './PageTitle.svelte';

	export let title = 'North of the Border Fireworks';
	export let description = '';
	export let subtitle = '';
</script>

<PageTitle {title} {description} />
<div class="main">
	<div class="main-container">
		<div class="title-container">
			<h1>
				{title}
			</h1>
			{#if subtitle !== ''}
				<h2>
					{subtitle}
				</h2>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero-bg.jpg') center;
		color: var(--white);
		display: flex;
		justify-content: center;
		padding-bottom: 0.5em;
		margin-top: -1em;
	}
	.main-container {
		width: 1024px;
		display: flex;
	}
	.title-container {
		transform: rotate(-7deg);
		padding: 0.25em 1em 0 1em;
		position: relative;
		top: 1.75em;
		left: -2em;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	h1,
	h2 {
		display: inline-block;
		background: var(--grey);
		padding: 0em 0.75em;
	}
	h2 {
		position: relative;
		top: -5px;
		right: -20px;
	}
</style>
