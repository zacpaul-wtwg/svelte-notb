<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	export let text = '';
	export let as = 'h2';
	export let className = '';
	export let place = 0; // offset from center in percent of half-width (-100 to 100 typical)
	export let nudge = 0; // pixel offset applied after place

	let headerEl;
	let labelEl;
	let groupX = '0px';
	let flyX = Number(place) <= 0 ? -90 : 90;

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
		groupX = `${clampedCenter - headerWidth / 2}px`;
		flyX = clampedCenter <= headerWidth / 2 ? -90 : 90;
	};

	onMount(() => {
		updatePlacement();
		const ro = new ResizeObserver(() => updatePlacement());
		if (headerEl) ro.observe(headerEl);
		if (labelEl) ro.observe(labelEl);
		window.addEventListener('resize', updatePlacement);
		return () => {
			ro.disconnect();
			window.removeEventListener('resize', updatePlacement);
		};
	});

	$: place, nudge, updatePlacement();
</script>

<div bind:this={headerEl} class={`section-header ${className}`.trim()} style={`--group-x:${groupX}`}>
	<div class="header-group">
		<div class="edge-line edge-line-left" aria-hidden="true"></div>
		<svelte:element bind:this={labelEl} this={as} class="label" in:fly={{ x: flyX, duration: 260 }}>
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
	}

	.edge-line {
		display: inline-block;
		vertical-align: middle;
		position: relative;
		width: 1400px;
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
		font-size: clamp(1.72rem, 3.15vw, 2.62rem);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		max-width: 100%;
		box-sizing: border-box;
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
