<script>
	import HeightScale from '$lib/components/HeightScale.svelte';
	import DurationClock from '$lib/components/DurationClock.svelte';
	import ShotDots from '$lib/components/ShotDots.svelte';

	export let height = '';
	export let duration = '';
	export let shots = '';

	const withUnit = (value, unit) => {
		if (!value) return 'Unlisted';
		const hasUnit = new RegExp(unit, 'i').test(String(value));
		const hasNumber = /\d/.test(String(value));
		if (hasNumber && !hasUnit) return `${value} ${unit}`;
		return String(value);
	};
</script>

<div class="spec-grid">
	<div class="spec-card">
		<div class="card-header black-header">
			<span class="label">Height</span>
			<span class="raw">{withUnit(height, 'ft')}</span>
		</div>
		<HeightScale {height} />
	</div>
	<div class="spec-card">
		<div class="card-header black-header">
			<span class="label">Duration</span>
			<span class="raw">{withUnit(duration, 'sec')}</span>
		</div>
		<DurationClock {duration} />
	</div>
	<div class="spec-card">
		<div class="card-header black-header">
			<span class="label">Shot Count</span>
			<span class="raw">{shots || 'Unlisted'}</span>
		</div>
		<ShotDots {shots} />
	</div>
</div>

<style type="text/css">
	.spec-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75em;
		width: 100%;
		box-sizing: border-box;
	}
	.spec-card {
		border: 1px solid var(--grey);
		border-left: 4px solid var(--yellow-accent);
		background: var(--white);
		padding: 2.6em 0.9em 0.9em;
		display: flex;
		flex-direction: column;
		gap: 0.6em;
		box-shadow: 3px 3px 0 var(--grey);
		position: relative;
		overflow: hidden;
	}
	.card-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75em;
	}
	.black-header {
		background: #111;
		padding: 0 0.8em;
		border-radius: 0;
		margin: 0;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.1);
		height: 32px;
		display: flex;
		align-items: center;
	}
	@media (max-width: 640px) {
		.spec-card {
			padding: 2.2em 0.65em 0.8em;
		}
		.black-header {
			padding: 0 0.7em;
			height: 28px;
		}
		.card-header {
			gap: 0.5em;
		}
		.label {
			font-size: 0.65em;
		}
		.raw {
			font-size: 0.75em;
		}
	}
	.label {
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.75em;
		color: var(--white);
		font-family: Langdon, Arial, sans-serif;
	}
	.raw {
		font-size: 0.85em;
		font-weight: 700;
		color: var(--white);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
</style>
