<script>
	export let type = '';

	const normalize = (value) =>
		String(value || '')
			.split(/[,/]/)
			.map((part) => part.trim())
			.filter(Boolean);

	$: types = normalize(type);
</script>

<div class="type-list">
	{#if types.length === 0}
		<span class="chip empty">Unlisted</span>
	{:else}
		{#each types as item}
			<span class="chip">{item}</span>
		{/each}
	{/if}
</div>

<style>
	.type-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35em;
		width: 100%;
	}
	.chip {
		padding: 0.25em 0.55em;
		border-radius: 999px;
		background: #111;
		color: #fff;
		font-size: 0.82em;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		max-width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.chip.empty {
		background: #222;
		color: var(--grey);
	}
</style>
