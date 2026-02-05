<script>
	import { onDestroy, onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import 'quill/dist/quill.snow.css';

	export let value = '';
	export let placeholder = 'Write something...';

	const dispatch = createEventDispatcher();

	let container;
	let quill;
	let updating = false;

	const toolbar = [
		[{ header: [2, 3, false] }],
		['bold', 'italic'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['link'],
		['clean']
	];

	onMount(async () => {
		const Quill = (await import('quill')).default;
		quill = new Quill(container, {
			theme: 'snow',
			placeholder,
			modules: { toolbar }
		});

		quill.root.innerHTML = value || '';

		quill.on('text-change', () => {
			if (updating) return;
			dispatch('change', quill.root.innerHTML);
		});
	});

	$: if (quill) {
		const next = value || '';
		if (quill.root.innerHTML !== next) {
			updating = true;
			const sel = quill.getSelection();
			quill.root.innerHTML = next;
			if (sel) quill.setSelection(sel);
			updating = false;
		}
	}

	onDestroy(() => {
		quill = null;
	});
</script>

<div class="quill-wrap">
	<div bind:this={container} class="quill-root"></div>
</div>

<style>
	.quill-wrap {
		display: block;
		width: 100%;
	}
	.quill-wrap :global(.ql-toolbar) {
		border-radius: 12px 12px 0 0;
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(0, 0, 0, 0.2);
		position: sticky;
		top: 0;
		z-index: 2;
	}
	.quill-wrap :global(.ql-container) {
		border-radius: 0 0 12px 12px;
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(0, 0, 0, 0.22);
		color: #eef0f6;
		min-height: 220px;
		height: auto;
	}
	.quill-wrap :global(.ql-editor) {
		padding-bottom: 28px;
		min-height: 220px;
	}
	.quill-wrap :global(.ql-editor) {
		font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell,
			Noto Sans, Helvetica, Arial, sans-serif;
		font-size: 14px;
		line-height: 1.5;
	}
	.quill-wrap :global(.ql-editor.ql-blank::before) {
		color: rgba(255, 255, 255, 0.45);
	}
</style>
