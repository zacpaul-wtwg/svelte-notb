<script>
	export let duration = '';
	const parseNumber = (value) => {
		if (value === null || value === undefined) return null;
		const match = String(value).match(/(\d+(\.\d+)?)/);
		return match ? Number(match[1]) : null;
	};
	$: numericDuration = parseNumber(duration);
	$: maxSeconds = 180;
	$: filledPercent =
		numericDuration === null
			? 0
			: Math.min(100, Math.max(0, (numericDuration / maxSeconds) * 100));
	$: overMax = numericDuration !== null && numericDuration > maxSeconds;
</script>

<div class="clock">
	<div class="display">
		<span class="digits">{numericDuration ?? '--'}</span>
		<span class="unit">sec</span>
	</div>
	<div class="scale">
		<div class="segments" aria-hidden="true">
			<div class="bar" class:over={overMax}>
				<div class="fill" style={`width: ${filledPercent}%`}></div>
				{#if overMax}
					<div class="over-cap">+{numericDuration - maxSeconds}s</div>
				{/if}
			</div>
		</div>
		<div class="labels" aria-hidden="true">
			<span>0s</span>
			<span>60s</span>
			<span>120s</span>
			<span>180s</span>
		</div>
	</div>
</div>

<style>
	.clock {
		display: flex;
		align-items: center;
		gap: 0.9em;
		width: 100%;
	}
	.scale {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.display {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		padding: 0.1em 0.6em;
		background: #111;
		color: #fff;
		border-radius: 6px;
		font-family: 'SevenSegment', 'Langdon', Arial, sans-serif;
		letter-spacing: 0.06em;
		min-height: 72px;
	}
	.digits {
		font-size: 3.5em;
		font-weight: 700;
		line-height: 1;
	}
	.unit {
		font-size: 1.05em;
		text-transform: uppercase;
		color: var(--yellow-accent);
	}
	.segments {
		display: flex;
		flex-direction: row;
		gap: 0;
		align-items: center;
		align-self: stretch;
		flex: 1;
		justify-content: space-between;
		min-width: 0;
	}
	.labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.72em;
		color: var(--grey);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-top: 0.6em;
	}
	.bar {
		position: relative;
		width: 100%;
		height: 62px;
		background: #111;
		border-radius: 2px;
		overflow: hidden;
	}
	.bar.over {
		outline: 2px solid var(--red);
	}
	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--red);
		transition: width 0.2s ease-out;
	}
	.over-cap {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		background: #111;
		color: var(--white);
		font-size: 0.85em;
		padding: 0.25em 0.6em;
		border: 1px solid var(--red);
		border-radius: 999px;
	}
	@media (max-width: 640px) {
		.clock {
			gap: 0.6em;
		}
		.display {
			padding: 0.1em 0.45em;
			min-height: 58px;
		}
		.digits {
			font-size: 2.6em;
		}
		.bar {
			height: 48px;
		}
		.labels {
			font-size: 0.62em;
		}
	}
</style>
