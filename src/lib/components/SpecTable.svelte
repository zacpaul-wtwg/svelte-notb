<script>
	export let height = '';
	export let duration = '';
	export let shots = '';
	export let type = '';
</script>

<div class="spec-grid">
	<div class="spec-card">
		<span class="label">Height</span>
		<span class="value">{height} feet</span>
	</div>
	<div class="spec-card">
		<span class="label">Duration</span>
		<span class="value">{duration} seconds</span>
	</div>
	<div class="spec-card">
		<span class="label">Shot Count</span>
		<span class="value">{shots}</span>
	</div>
	<div class="spec-card">
		<span class="label">Cake Type</span>
		<span class="value">{type}</span>
	</div>
</div>

<style type="text/css">
	.spec-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.75em;
	}
	.spec-card {
		border: 1px solid var(--grey);
		border-left: 4px solid var(--yellow-accent);
		background: var(--white);
		padding: 0.7em 0.9em;
		display: flex;
		flex-direction: column;
		gap: 0.35em;
		box-shadow: 3px 3px 0 var(--grey);
	}
	.label {
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.75em;
		color: var(--grey);
		font-family: Langdon, Arial, sans-serif;
	}
	.value {
		font-size: 1.05em;
		font-weight: 700;
		color: var(--black, #000);
	}
</style>
