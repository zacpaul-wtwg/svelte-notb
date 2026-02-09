<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let size = 'medium'; // mini | small | medium | large
	export let type = 'button';
	export let className = '';
	export let disabled = false;

	const DESKTOP_FLOAT_X_PX = -5;
	const DESKTOP_FLOAT_Y_PX = -5;
	const DESKTOP_HOVER_ANIMATION_MS = 150;
	const hoverProgress = tweened(0, { duration: DESKTOP_HOVER_ANIMATION_MS, easing: cubicOut });
	const setHovered = (value) => {
		hoverProgress.set(value ? 1 : 0, {
			duration: DESKTOP_HOVER_ANIMATION_MS,
			easing: cubicOut
		});
	};
</script>

<span class={`nav-pill-shell nav-pill-${size} ${className}`.trim()}>
	<button
		type={type}
		class="nav-pill"
		disabled={disabled}
		style={`--nav-float-x:${DESKTOP_FLOAT_X_PX * $hoverProgress}px;--nav-float-y:${DESKTOP_FLOAT_Y_PX * $hoverProgress}px`}
		on:mouseenter={() => setHovered(true)}
		on:mouseleave={() => setHovered(false)}
		on:focus={() => setHovered(true)}
		on:blur={() => setHovered(false)}
		on:click
	>
		<span class="label"><slot /></span>
	</button>
</span>

<style>
	.nav-pill-shell {
		position: relative;
		display: inline-block;
		line-height: 0;
	}

	.nav-pill-shell::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--yellow-accent);
		box-shadow: 2px 2px 0 var(--yellow-accent);
		transform: skew(-14deg);
		pointer-events: none;
		z-index: 0;
	}

	.nav-pill {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		box-shadow: none;
		transform: skew(-14deg) translate(var(--nav-float-x, 0px), var(--nav-float-y, 0px));
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.nav-pill .label {
		display: block;
		width: 100%;
		padding: 0 0.45rem;
		box-sizing: border-box;
		text-align: right;
		transform: skew(14deg);
		line-height: 1;
	}

	.nav-pill-shell.nav-pill-mini .nav-pill {
		height: 24px;
		padding: 1px 0.34rem;
		font-size: 1.08rem;
	}

	.nav-pill-shell.nav-pill-small .nav-pill {
		height: 28px;
		padding: 0 0.48rem;
		font-size: 1.14rem;
	}

	.nav-pill-shell.nav-pill-medium .nav-pill {
		height: 30px;
		padding: 0 0.62rem;
		font-size: 1.2rem;
	}

	.nav-pill-shell.nav-pill-large .nav-pill {
		height: 36px;
		padding: 0 0.78rem;
		font-size: 1.35rem;
	}

	.nav-pill:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
