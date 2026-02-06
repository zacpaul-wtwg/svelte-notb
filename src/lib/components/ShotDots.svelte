<script>
	export let shots = '';
	const parseNumber = (value) => {
		if (value === null || value === undefined) return null;
		const match = String(value).match(/(\d+(\.\d+)?)/);
		return match ? Number(match[1]) : null;
	};
	$: numericShots = parseNumber(shots);
	$: totalDots = 24;
	$: filled = numericShots === null ? 0 : Math.min(totalDots, Math.round(numericShots));
	$: extra = numericShots !== null && numericShots > totalDots ? numericShots - totalDots : 0;
</script>

<div class="shot-dots">
	<div class="dot-grid" aria-hidden="true">
		{#each Array(totalDots) as _, i}
			<span class:filled={i < filled}></span>
		{/each}
	</div>
	{#if extra > 0}
		<div class="more">+{extra}</div>
	{/if}
</div>

<style>
	.shot-dots {
		display: flex;
		align-items: center;
		gap: 0.6em;
		width: 100%;
		box-sizing: border-box;
	}
	.dot-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 4px;
		width: 100%;
	}
	.dot-grid span {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #222;
	}
	.dot-grid span.filled {
		background: var(--yellow-accent);
		box-shadow: 0 0 6px rgba(255, 213, 0, 0.6);
	}
	.more {
		font-size: 0.9em;
		color: var(--grey);
		font-weight: 700;
	}
	@media (max-width: 640px) {
		.dot-grid {
			grid-template-columns: repeat(6, 1fr);
		}
		.dot-grid span {
			width: 8px;
			height: 8px;
		}
		.more {
			font-size: 0.8em;
		}
	}
</style>
