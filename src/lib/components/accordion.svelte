<script>
	import { renderMarkdown } from '$lib/markdown';
	export let title;
	export let answer;
</script>

<div>
	<h2>{title}</h2>
	<div class="md">{@html renderMarkdown(answer)}</div>
</div>

<style>
	div {
		display: block;
		max-width: 1024px;
	}
</style>
