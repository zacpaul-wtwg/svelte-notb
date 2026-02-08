<script>
	import { renderMarkdown } from '$lib/markdown';
	import { slide } from 'svelte/transition';
	export let title;
	export let answer;
	export let open = false;
	export let onToggle = () => {};

	const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
</script>

<div class="faq-item">
	<button
		class="summary"
		type="button"
		on:click={onToggle}
		aria-expanded={open}
	>
		<span class="q">Q</span>
		<span class="title">{title}</span>
		<span class="chev" aria-hidden="true">+</span>
	</button>
	{#if open}
		<div class="answer-wrap" transition:slide={{ duration: 260 }}>
			{#if looksLikeHtml(answer)}
				<div class="answer md">{@html answer}</div>
			{:else}
				<div class="answer md">{@html renderMarkdown(answer)}</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.faq-item {
		border: 2px solid var(--grey);
		background: var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		margin: 0;
	}
	.summary {
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.6em;
		padding: 0.75em 1em;
		cursor: pointer;
		background: var(--white);
		color: var(--grey);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-family: Langdon, Arial, sans-serif;
		border: none;
		width: 100%;
		text-align: left;
	}
	.q {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--grey);
		box-shadow: 3px 3px 0 var(--yellow-accent);
		font-weight: 700;
	}
	.title {
		flex: 1;
	}
	.chev {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--grey);
		box-shadow: 3px 3px 0 var(--yellow-accent);
		font-weight: 900;
		transition: transform 0.3s ease;
	}
	.summary[aria-expanded='true'] .chev {
		transform: translateX(18px);
	}
	.answer-wrap {
		overflow: hidden;
	}
	.answer {
		overflow: hidden;
		padding: 0 1.1em;
		color: var(--grey);
		min-height: 0;
	}
	.answer {
		padding: 0.9em 1.1em 1.2em;
	}
	.answer :global(p) {
		margin: 0 0 0.9em 0;
		line-height: 1.55;
	}
	.answer :global(ul) {
		margin: 0.4em 0 0.8em;
		padding-left: 1.3em;
	}
	@media (max-width: 700px) {
		.summary {
			padding: 0.6em 0.8em;
		}
		.answer {
			padding: 0.8em 0.9em 1em;
		}
	}
</style>
