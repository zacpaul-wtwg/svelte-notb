<script>
	import { onDestroy, onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import IMask from 'imask';

	export let value = '';
	export let disabled = false;

	const dispatch = createEventDispatcher();
	let inputEl;
	let mask;

	const maskOptions = {
		mask: '{h1} {a1} - {h2} {a2}',
		blocks: {
			h1: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2 },
			h2: { mask: IMask.MaskedRange, from: 1, to: 12, maxLength: 2 },
			a1: { mask: IMask.MaskedEnum, enum: ['AM', 'PM'] },
			a2: { mask: IMask.MaskedEnum, enum: ['AM', 'PM'] }
		},
		overwrite: true,
		lazy: false
	};

	onMount(() => {
		mask = IMask(inputEl, maskOptions);
		mask.on('accept', () => {
			dispatch('change', mask.value);
		});
		if (value && value.toLowerCase() !== 'closed') {
			mask.value = value.toUpperCase();
		}
	});

	$: if (mask && !disabled && value && value.toLowerCase() !== 'closed') {
		if (mask.value !== value.toUpperCase()) mask.value = value.toUpperCase();
	}

	$: if (mask && (disabled || !value || value.toLowerCase() === 'closed')) {
		if (mask.value) mask.value = '';
		if (inputEl) inputEl.value = disabled ? 'Closed' : '';
	}

	onDestroy(() => {
		if (mask) {
			mask.destroy();
			mask = null;
		}
	});
</script>

<input
	class="input"
	bind:this={inputEl}
	type="text"
	{disabled}
	aria-label="Store hours"
/>
