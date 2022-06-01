<script>
	export let string;
	export let length = 50;
	export let sentenceAsArray = string.split(' ');
	export const sentenceLength = sentenceAsArray.length;
</script>

{#if sentenceLength > length}
	{sentenceAsArray.slice(0, length).join(' ')}
	<slot />
{:else}
	{string}
{/if}
