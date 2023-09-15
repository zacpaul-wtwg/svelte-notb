<script>
	import SvelteMarkdown from 'svelte-markdown';
	export let allData;
	import { date } from '$lib/utility/date';
	console.log(allData);
</script>

<div class="padding-bottom">
	<h2 class="red">Attention! Special Store Hours for "{allData.closedRange[0].occasion}"</h2>

	<p>
		North of the Border Fireworks will be closed
		<strong>
			{new Date(date(allData.closedRange[0].startOfBreak)).toDateString()}

			-
			{new Date(date(allData.closedRange[0].startOfBreak)).toDateString()}
		</strong>.
	</p>
	<p>
		{allData.closedRange[0].moreInfo}
	</p>
	<hr />
</div>

<style lang="scss">
	.padding-bottom {
		padding-bottom: 4em;
	}

	.red {
		background-color: var(--red);
		padding: 0.25em;
		color: white;
	}
</style>
