<script>
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';

	export let shots = '';
	export let burstCount = 6;
	export let burstDistance = 18;
	export let burstSpread = 8;
	export let burstInterval = 180;

	const parseNumber = (value) => {
		if (value === null || value === undefined) return null;
		const match = String(value).match(/(\d+(\.\d+)?)/);
		return match ? Number(match[1]) : null;
	};
	$: numericShots = parseNumber(shots);
	$: totalDots = 100;
	$: filled = numericShots === null ? 0 : Math.min(totalDots, Math.round(numericShots));
	$: extra = numericShots !== null && numericShots > totalDots ? numericShots - totalDots : 0;

	const burstIntervals = new Map();
	const burst = (event) => {
		if (!browser) return;
		const target = event.currentTarget;
		if (!target) return;
		const baseColor = window.getComputedStyle(target).backgroundColor;
		for (let i = 0; i < burstCount; i++) {
			const particle = document.createElement('span');
			particle.className = 'shot-particle';
			particle.style.background = baseColor;
			particle.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.35)';
			const angle = Math.random() * Math.PI * 2;
			const distance = burstDistance + Math.random() * burstSpread;
			particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
			particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
			target.appendChild(particle);
			particle.addEventListener('animationend', () => particle.remove());
		}
	};
	const startBurst = (event) => {
		if (!browser) return;
		const target = event.currentTarget;
		if (!target || burstIntervals.has(target)) return;
		burst(event);
		const id = window.setInterval(() => burst({ currentTarget: target }), burstInterval);
		burstIntervals.set(target, id);
	};
	const stopBurst = (event) => {
		if (!browser) return;
		const target = event.currentTarget;
		const id = burstIntervals.get(target);
		if (id) {
			window.clearInterval(id);
			burstIntervals.delete(target);
		}
	};
	const bursting = (node, enabled) => {
		if (!browser) return { update() {}, destroy() {} };
		if (enabled) startBurst({ currentTarget: node });
		return {
			update(nextEnabled) {
				if (nextEnabled) {
					startBurst({ currentTarget: node });
				} else {
					stopBurst({ currentTarget: node });
				}
			},
			destroy() {
				stopBurst({ currentTarget: node });
			}
		};
	};
	onDestroy(() => {
		if (!browser) return;
		for (const [target, id] of burstIntervals.entries()) {
			window.clearInterval(id);
			burstIntervals.delete(target);
		}
	});
</script>

<div class="shot-dots">
	<div class="dot-grid" aria-hidden="true">
		{#each Array(totalDots) as _, i}
			<span
				class:filled={i < filled}
				use:bursting={i < filled}
			></span>
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
		grid-template-columns: repeat(20, 1fr);
		gap: 3px;
		width: 100%;
	}
	.dot-grid span {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #222;
		position: relative;
	}
	.dot-grid span.filled {
		background: var(--red);
		box-shadow: 0 0 6px rgba(145, 25, 0, 0.6);
	}
	:global(.shot-particle) {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		animation: particle-burst 0.55s ease-out forwards;
		pointer-events: none;
	}
	@keyframes particle-burst {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3);
		}
	}
	.more {
		font-size: 0.9em;
		color: var(--grey);
		font-weight: 700;
	}
	@media (max-width: 640px) {
		.dot-grid {
			grid-template-columns: repeat(10, 1fr);
			gap: 3px;
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
