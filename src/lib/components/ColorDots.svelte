<script>
	import { browser } from '$app/environment';
	import { afterUpdate, onDestroy, onMount } from 'svelte';

	export let colors = [];
	export let maxDots = 6;
	export let dotSize = 20;
	export let burstCount = 8;
	export let burstDistance = 34;
	export let burstSpread = 14;
	export let burstInterval = 200;
	export let showLabels = false;
	export let adaptiveRadiusOnWrap = false;
	export let wrappedRadius = 10;

	const burstIntervals = new Map();
	let colorDotsEl;
	let isWrapped = false;
	let resizeObserver;

	const measureWrap = () => {
		if (!browser || !adaptiveRadiusOnWrap || !colorDotsEl) {
			isWrapped = false;
			return;
		}
		const items = [...colorDotsEl.querySelectorAll('.color-item')];
		if (items.length < 2) {
			isWrapped = false;
			return;
		}
		const firstTop = items[0]?.offsetTop ?? 0;
		isWrapped = items.some((item) => item.offsetTop !== firstTop);
	};

	const burst = (event) => {
		if (!browser) return;
		const target = event.currentTarget;
		if (!target) return;
		const baseColor = window.getComputedStyle(target).backgroundColor;
		for (let i = 0; i < burstCount; i++) {
			const particle = document.createElement('span');
			particle.className = 'particle';
			particle.style.background = baseColor;
			particle.style.boxShadow = `0 0 0 3px rgba(255,255,255,0.7)`;
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

	onMount(() => {
		if (!browser || !adaptiveRadiusOnWrap || !colorDotsEl) return;
		resizeObserver = new ResizeObserver(measureWrap);
		resizeObserver.observe(colorDotsEl);
		measureWrap();
	});

	afterUpdate(() => {
		if (browser && adaptiveRadiusOnWrap) measureWrap();
	});

	onDestroy(() => {
		if (!browser) return;
		resizeObserver?.disconnect();
		for (const [target, id] of burstIntervals.entries()) {
			window.clearInterval(id);
			burstIntervals.delete(target);
		}
	});
</script>

<div
	class="color-dots"
	class:wrapped={isWrapped}
	style="--dot-size: {dotSize}px; --wrapped-radius: {wrappedRadius}px;"
	bind:this={colorDotsEl}
>
	{#each colors.slice(0, maxDots) as color}
		<span class="color-item">
			<button
				type="button"
				class="dot"
				style="background: {color};"
				aria-label={`Color ${color}`}
				on:mouseenter={startBurst}
				on:mouseleave={stopBurst}
				on:click|stopPropagation={burst}
			></button>
			{#if showLabels}
				<span class="color-label">{color}</span>
			{/if}
		</span>
	{/each}
</div>

<style>
.color-dots {
	display: inline-flex;
	gap: 0.4em;
	flex-wrap: wrap;
	align-items: center;
	background: var(--grey);
	padding: 0.5em 0.7em;
	border-radius: 18px;
}
.color-dots.wrapped {
	border-radius: var(--wrapped-radius);
}
.color-item {
	display: inline-flex;
	align-items: center;
	gap: 0.35em;
}
.color-label {
	padding: 0.2em 0.5em;
	border: 1px solid var(--grey);
	background: var(--white);
	text-transform: uppercase;
	letter-spacing: 0.03em;
	font-size: 0.7em;
	border-radius: 999px;
}
	.dot {
		padding: 0;
		border: 1px solid var(--white);
		cursor: pointer;
		background: transparent;
		width: var(--dot-size);
		height: var(--dot-size);
		border-radius: 50%;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
		position: relative;
		isolation: isolate;
	}
	:global(.particle) {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(var(--dot-size) * 0.4);
		height: calc(var(--dot-size) * 0.4);
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
</style>
