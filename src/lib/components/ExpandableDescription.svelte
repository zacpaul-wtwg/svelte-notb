<script>
	import { onDestroy, onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import ShortenSentence from '$lib/utility/ShortenSentence.svelte';

	export let text = '';
	export let fallbackText = 'Description coming soon!';
	export let truncateWords = 25;
	export let lineClamp = 3;
	export let overlay = true;
	export let expanded = false;

	let collapsedHeight = 0;
	let descriptionEl;
	let paragraphEl;
	let hasVisualOverflow = false;

	$: resolvedText = text === undefined ? fallbackText : text;
	$: wordCount = String(resolvedText || '').trim().split(/\s+/).filter(Boolean).length;
	$: hasHiddenContent = wordCount > truncateWords || hasVisualOverflow;

	const measureDescription = async () => {
		await tick();
		if (!descriptionEl || !paragraphEl) return;
		collapsedHeight = Math.ceil(descriptionEl.getBoundingClientRect().height);
		hasVisualOverflow = paragraphEl.scrollHeight > paragraphEl.clientHeight + 1;
	};

	const toggleExpanded = () => {
		if (!hasHiddenContent) return;
		expanded = !expanded;
	};

	const handleDocumentClick = (event) => {
		if (!expanded) return;
		if (!descriptionEl || !event?.target) return;
		if (descriptionEl.contains(event.target)) return;
		expanded = false;
	};

	onMount(async () => {
		await measureDescription();
		if (browser) document.addEventListener('click', handleDocumentClick);
	});

	onDestroy(() => {
		if (browser) document.removeEventListener('click', handleDocumentClick);
	});

	$: if (!expanded) {
		measureDescription();
	}
</script>

<div class="description-wrap" style={`min-height: ${collapsedHeight || 0}px;`}>
	<div
		class="description-card {expanded ? 'expanded' : ''} {overlay ? 'overlay' : 'inline'}"
		role="button"
		tabindex="0"
		aria-expanded={expanded}
		aria-disabled={!hasHiddenContent}
		bind:this={descriptionEl}
		on:click={toggleExpanded}
		on:keydown={(event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				toggleExpanded();
			}
		}}
	>
		<p style={`--line-clamp:${lineClamp};`} bind:this={paragraphEl}>
			{#if expanded}
				{resolvedText}
			{:else}
				<ShortenSentence string={resolvedText} length={truncateWords}>...</ShortenSentence>
			{/if}
		</p>
	</div>
</div>

<style>
	.description-wrap {
		position: relative;
	}
	.description-card {
		background: var(--white);
		border: 1px solid var(--grey);
		padding: 0.5em 0.6em;
		cursor: pointer;
		transition: box-shadow 0.2s ease;
	}
	.description-card:focus {
		outline: 2px solid var(--yellow-accent);
		outline-offset: 2px;
	}
	.description-card p {
		margin: 0;
		line-height: 1.35;
		display: -webkit-box;
		-webkit-line-clamp: var(--line-clamp, 3);
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.description-card.expanded p {
		-webkit-line-clamp: unset;
		overflow: visible;
		display: block;
	}
	.description-card.overlay.expanded {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		z-index: 40;
		box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);
	}
</style>
