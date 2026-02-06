<script>
	export let label;
	export let values = [];
	export let selectedValues = [];
</script>

<h3>{label}</h3>
{#each values as value}
	<label class="toggle-row">
		<span class="toggle-label">{value}</span>
		<span class="toggle">
			<input type="checkbox" bind:group={selectedValues} {value} />
			<span class="track"></span>
			<span class="thumb"></span>
		</span>
	</label>
{/each}

<style>
	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75em;
		margin: 0.35em 0;
		font-size: 0.9em;
	}
	.toggle-label {
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.toggle {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 44px;
		height: 24px;
	}
	.toggle input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}
	.track {
		position: absolute;
		inset: 0;
		background: var(--grey);
		border-radius: 999px;
		transition: background 0.2s ease;
	}
	.thumb {
		position: absolute;
		left: 3px;
		width: 18px;
		height: 18px;
		background: var(--white);
		border-radius: 50%;
		transition: transform 0.2s ease;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}
	.toggle input:checked + .track {
		background: var(--yellow-accent);
	}
	.toggle input:checked + .track + .thumb {
		transform: translateX(20px);
	}
</style>
