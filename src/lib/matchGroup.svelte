<script>
	export let label;
	export let values = [];
	export let selectedValues = [];
</script>

<h3>
	{label}
</h3>
{#each values as value}
	<div>
		<label><input type="checkbox" bind:group={selectedValues} {value} /> {value} </label>
	</div>
{/each}
