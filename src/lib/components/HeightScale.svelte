<script>
	export let height = '';
	export let min = 0;
	export let max = 300;

	const parseNumber = (value) => {
		if (value === null || value === undefined) return null;
		const match = String(value).match(/(\d+(\.\d+)?)/);
		return match ? Number(match[1]) : null;
	};

	$: numericHeight = parseNumber(height);
	$: safeMax = Math.max(max, numericHeight ?? 0, 1);
	$: percent =
		numericHeight === null ? null : Math.min(100, Math.max(0, (numericHeight / safeMax) * 100));
	$: clampedPercent = percent === null ? null : Math.min(98, Math.max(2, percent));
	$: ticks = 13;
</script>

<div class="scale">
	<div class="scale-track">
		<div class="track" aria-hidden="true">
			{#each Array(ticks) as _, i}
				<span
					class="tick"
					class:half={i % 3 === 0}
					class:full={i % 6 === 0}
					style={`left: ${(i / (ticks - 1)) * 100}%`}
				></span>
			{/each}
			{#if percent !== null}
				<div class="marker" style={`left: ${clampedPercent}%`}>
					<span class="dot"></span>
					<span class="label">{numericHeight}ft</span>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.scale {
		display: flex;
		flex-direction: column;
		gap: 1.2em;
		width: 100%;
		box-sizing: border-box;
	}
	.scale-track {
		padding: 1em 0;
		min-height: 1px;
		width: 100%;
		box-sizing: border-box;
	}
	.track {
		position: relative;
		height: 18px;
		background: #111;
		border-radius: 0;
		overflow: visible;
		width: 100%;
		box-sizing: border-box;
	}
	.tick {
		position: absolute;
		top: 50%;
		width: 3px;
		height: 26px;
		background: #111;
		transform: translate(-50%, -50%);
		border-radius: 0;
	}
	.tick.half {
		height: 34px;
	}
	.tick.full {
		height: 44px;
	}
	.marker {
		position: absolute;
		top: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2em;
	}
	.dot {
		display: block;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--yellow-accent);
		box-shadow: 0 0 0 3px #111, 0 0 8px rgba(255, 213, 0, 0.7);
		transform: translateY(-50%);
	}
	.marker .label {
		background: #111;
		color: #fff;
		padding: 0.1em 0.5em;
		border-radius: 999px;
		font-size: 0.7em;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	@media (max-width: 700px) {
		.scale {
			gap: 1em;
		}
		.scale-track {
			padding: 0.8em 0;
		}
		.tick {
			width: 2px;
		}
		.tick.half {
			height: 30px;
		}
		.tick.full {
			height: 40px;
		}
		.marker .label {
			font-size: 0.62em;
		}
	}
</style>
