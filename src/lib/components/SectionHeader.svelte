<script>
	import { onMount, tick } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let text = '';
	export let as = 'h2';
	export let className = '';
	export let size = 'large'; // mini | small | medium | large
	export let place = 0; // offset from center in percent of half-width (-100 to 100 typical)
	export let nudge = 0; // pixel offset applied after place

	let headerEl;
	let labelEl;
	let groupX = 0;
	let nearestEdge = 'left';
	let hasEntered = false;
	let isVisible = false;
	const IN_VIEW_DELAY_MS = 140;
	const animatedGroupX = tweened(0, { duration: 0, easing: cubicOut });
	let enterTimer;

	const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

	const updatePlacement = () => {
		if (!headerEl || !labelEl) return;
		const headerWidth = headerEl.clientWidth;
		const labelWidth = labelEl.getBoundingClientRect().width;
		if (!headerWidth || !labelWidth) return;

		const safePad = 10;
		const desiredCenter = headerWidth / 2 + (Number(place) / 100) * (headerWidth / 2) + Number(nudge);
		const minCenter = labelWidth / 2 + safePad;
		const maxCenter = headerWidth - labelWidth / 2 - safePad;
		const clampedCenter = clamp(desiredCenter, minCenter, maxCenter);
		groupX = clampedCenter - headerWidth / 2;
		const distToLeftEdge = clampedCenter;
		const distToRightEdge = headerWidth - clampedCenter;
		nearestEdge = distToLeftEdge <= distToRightEdge ? 'left' : 'right';

		if (hasEntered) {
			animatedGroupX.set(groupX, { duration: 0 });
		}
	};

	const getOffscreenStartX = (edge) => {
		const headerWidth = headerEl?.clientWidth || 0;
		const labelWidth = labelEl?.getBoundingClientRect().width || 300;
		const offscreenPad = 24;
		if (edge === 'left') {
			return -(headerWidth / 2 + labelWidth / 2 + offscreenPad);
		}
		return headerWidth / 2 + labelWidth / 2 + offscreenPad;
	};

	onMount(() => {
		const ro = new ResizeObserver(() => updatePlacement());
		if (headerEl) ro.observe(headerEl);
		if (labelEl) ro.observe(labelEl);
		window.addEventListener('resize', updatePlacement);
		updatePlacement();

		const io = new IntersectionObserver(
			async (entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting || hasEntered) return;
				let entryEdge = nearestEdge;
				if (Math.abs(Number(place)) <= 1) {
					entryEdge = Math.random() < 0.5 ? 'left' : 'right';
				}
				const startX = getOffscreenStartX(entryEdge);
				animatedGroupX.set(startX, { duration: 0 });
				isVisible = true;
				await tick();
				enterTimer = setTimeout(() => {
					hasEntered = true;
					animatedGroupX.set(groupX, { duration: 360, easing: cubicOut });
				}, IN_VIEW_DELAY_MS);
				io.disconnect();
			},
			{ threshold: 0.2 }
		);
		if (headerEl) io.observe(headerEl);

		return () => {
			ro.disconnect();
			io.disconnect();
			if (enterTimer) clearTimeout(enterTimer);
			window.removeEventListener('resize', updatePlacement);
		};
	});

	$: place, nudge, updatePlacement();
</script>

<div
	bind:this={headerEl}
	class={`section-header ${size === 'mini' ? 'is-mini' : ''} ${className}`.trim()}
	style={`--group-x:${$animatedGroupX}px`}
>
	<div class={`header-group ${isVisible ? 'is-visible' : ''}`.trim()}>
		<div class="edge-line edge-line-left" aria-hidden="true"></div>
		<svelte:element bind:this={labelEl} this={as} class={`label size-${size}`.trim()}>
			<span><slot>{text}</slot></span>
		</svelte:element>
		<div class="edge-line edge-line-right" aria-hidden="true"></div>
	</div>
</div>

<style>
	.section-header {
		width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: 0;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		padding: 0 1rem;
		box-sizing: border-box;
		overflow: hidden;
		white-space: nowrap;
	}

	.header-group {
		display: inline-block;
		white-space: nowrap;
		position: relative;
		left: 50%;
		transform: translateX(calc(-50% + var(--group-x)));
		visibility: hidden;
	}

	.header-group.is-visible {
		visibility: visible;
	}

	.edge-line {
		display: inline-block;
		vertical-align: middle;
		position: relative;
		width: 150vw;
		height: 2px;
		background: var(--grey);
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}

	.edge-line-left {
		margin-right: 20px;
		top: 24px;
	}

	.edge-line-right {
		margin-left: 20px;
		top: -16px;
	}

	.label {
		display: inline-block;
		vertical-align: middle;
		margin: 0.5rem 0;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		transform: skew(-14deg);
		padding: 0.32rem 0.9rem;
		font-family: Langdon, Arial, sans-serif;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		max-width: 100%;
		box-sizing: border-box;
	}

	.label.size-mini {
		font-size: clamp(0.92rem, 1.4vw, 1.3rem);
	}

	.section-header.is-mini {
		margin-bottom: -1rem;
		position: relative;
	}

	.section-header.is-mini .edge-line {
		position: relative;
		z-index: -1;
	}

	.label.size-small {
		font-size: clamp(1.15rem, 1.9vw, 1.7rem);
	}

	.label.size-medium {
		font-size: clamp(1.38rem, 2.45vw, 2.1rem);
	}

	.label.size-large {
		font-size: clamp(1.72rem, 3.15vw, 2.62rem);
	}

	.label span {
		display: block;
		transform: skew(14deg);
	}

	@media (max-width: 700px) {
		.section-header {
			padding: 0 0.75rem;
		}
	}
</style>
