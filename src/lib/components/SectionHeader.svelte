<script>
	import { onMount, tick } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let text = '';
	export let as = 'h2';
	export let className = '';
	export let variant = 'default'; // default | page
	export let size = 'large'; // mini | small | medium | large
	export let place = 0; // offset from center in percent of half-width (-100 to 100 typical)
	export let nudge = 0; // pixel offset applied after place
	export let showLeftLine = true;
	export let showRightLine = false;

	let headerEl;
	let labelEl;
	let labelWidth = 0;
	let labelCenter = 0;
	let nearestEdge = 'left';
	let hasEntered = false;
	let isVisible = false;
	const IN_VIEW_DELAY_MS = 140;
	const animatedLabelCenter = tweened(0, { duration: 0, easing: cubicOut });
	let enterTimer;

	const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
	const isPageVariant = () => variant === 'page';
	const effectivePlace = () => (isPageVariant() && Number(place) === 0 ? -50 : Number(place));
	const effectiveShowLeftLine = () => (isPageVariant() ? true : showLeftLine);
	const effectiveShowRightLine = () => (isPageVariant() ? false : showRightLine);

	const updatePlacement = () => {
		if (!headerEl || !labelEl) return;
		const headerWidth = headerEl.clientWidth;
		labelWidth = labelEl.getBoundingClientRect().width;
		if (!headerWidth || !labelWidth) return;

		const safePad = 10;
		const desiredCenter = headerWidth / 2 + (effectivePlace() / 100) * (headerWidth / 2) + Number(nudge);
		const minCenter = labelWidth / 2 + safePad;
		const maxCenter = headerWidth - labelWidth / 2 - safePad;
		const clampedCenter = clamp(desiredCenter, minCenter, maxCenter);
		labelCenter = clampedCenter;
		const distToLeftEdge = clampedCenter;
		const distToRightEdge = headerWidth - clampedCenter;
		nearestEdge = distToLeftEdge <= distToRightEdge ? 'left' : 'right';

		if (hasEntered) {
			animatedLabelCenter.set(labelCenter, { duration: 0 });
		}
	};

	const getOffscreenStartCenter = (edge) => {
		const headerWidth = headerEl?.clientWidth || 0;
		const labelWidth = labelEl?.getBoundingClientRect().width || 300;
		const offscreenPad = 24;
		if (edge === 'left') {
			return -(labelWidth / 2 + offscreenPad);
		}
		return headerWidth + labelWidth / 2 + offscreenPad;
	};

	const enter = async () => {
		if (hasEntered || !headerEl) return;
		let entryEdge = nearestEdge;
		if (Math.abs(effectivePlace()) <= 1) {
			entryEdge = Math.random() < 0.5 ? 'left' : 'right';
		}
		const startCenter = getOffscreenStartCenter(entryEdge);
		animatedLabelCenter.set(startCenter, { duration: 0 });
		isVisible = true;
		await tick();
		enterTimer = setTimeout(() => {
			hasEntered = true;
			animatedLabelCenter.set(labelCenter, { duration: 360, easing: cubicOut });
		}, IN_VIEW_DELAY_MS);
	};

	onMount(() => {
		const ro = new ResizeObserver(() => updatePlacement());
		if (headerEl) ro.observe(headerEl);
		if (labelEl) ro.observe(labelEl);
		window.addEventListener('resize', updatePlacement);
		updatePlacement();

		const io = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting || hasEntered) return;
				enter();
				io.disconnect();
			},
			{ threshold: 0, rootMargin: '-25% 0px -25% 0px' }
		);
		if (headerEl) io.observe(headerEl);
		// If already on-screen at load (e.g. page title), enter immediately.
		const rect = headerEl?.getBoundingClientRect();
		if (rect && rect.bottom > 0 && rect.top < window.innerHeight) {
			enter();
			io.disconnect();
		}

		return () => {
			ro.disconnect();
			io.disconnect();
			if (enterTimer) clearTimeout(enterTimer);
			window.removeEventListener('resize', updatePlacement);
		};
	});

	$: variant, place, nudge, showLeftLine, showRightLine, updatePlacement();
</script>

<div
	bind:this={headerEl}
	class={`section-header ${variant === 'page' ? 'is-page' : ''} ${size === 'mini' ? 'is-mini' : ''} ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
	style={`--label-center:${$animatedLabelCenter}px;--label-half:${labelWidth / 2}px`}
>
	<div class="line-layer" aria-hidden="true">
		{#if effectiveShowLeftLine()}
			<div class="edge-line edge-line-left"></div>
		{/if}
		{#if effectiveShowRightLine()}
			<div class="edge-line edge-line-right"></div>
		{/if}
	</div>
	<svelte:element bind:this={labelEl} this={as} class={`label size-${size}`.trim()}>
		<span><slot>{text}</slot></span>
	</svelte:element>
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
		overflow: visible;
		position: relative;
		min-height: 3.6rem;
	}

	.section-header.is-page {
		margin-top: -0.9rem;
		margin-bottom: calc(0.6rem - 34px);
		top: -34px;
		z-index: 4;
	}

	.section-header.is-page .label {
		box-shadow: 6px 10px 0 var(--yellow-accent);
	}

	.section-header:not(.is-visible) .line-layer,
	.section-header:not(.is-visible) .label {
		visibility: hidden;
	}

	.line-layer {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
		pointer-events: none;
	}

	.edge-line {
		display: block;
		position: absolute;
		width: 150vw;
		height: 2px;
		background: var(--grey);
		box-shadow: 3px 3px 0 var(--yellow-accent);
		z-index: 0;
	}

	.edge-line-left {
		top: 53px;
		left: calc(var(--label-center) - var(--label-half) - 20px - 150vw);
	}

	.edge-line-right {
		left: calc(var(--label-center) + var(--label-half) + 20px);
		top: 27px;
	}

	.label {
		display: block;
		position: absolute;
		left: calc(var(--label-center) - var(--label-half));
		top: 50%;
		margin: 0;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		transform: translateY(-50%) skew(-14deg);
		padding: 0.32rem 0.9rem;
		font-family: Langdon, Arial, sans-serif;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		max-width: 100%;
		box-sizing: border-box;
		z-index: 1;
	}

	.label.size-mini {
		font-size: clamp(0.92rem, 1.4vw, 1.3rem);
	}

	.section-header.is-mini {
		margin-bottom: -1rem;
		position: relative;
		overflow: visible;
	}

	.section-header.is-mini .edge-line {
		z-index: 0;
	}

	.section-header.is-mini .label {
		z-index: 2;
	}

	:global(.section-header.is-mini) + :global(*) {
		position: relative;
		z-index: 1;
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
