<script>
	export let string;
	export let altString = 'Description coming soon!';
	if (string === undefined) {
		string = altString;
	}
	export let length = 25;
	export let sentenceAsArray = string?.split(' ');
	export const sentenceLength = sentenceAsArray.length;
</script>

{#if sentenceLength > length}
	{sentenceAsArray.slice(0, length).join(' ')}
	<slot />
{:else}
	{string}
{/if}
