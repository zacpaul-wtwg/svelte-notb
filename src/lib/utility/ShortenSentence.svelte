<script>
	export let string;
	$: description = string;
	export let altString = 'Description coming soon!';
	if (description === undefined) {
		description = altString;
	}
	export let length = 25;
	export let sentenceAsArray = description?.split(' ');
	export const sentenceLength = sentenceAsArray.length;
</script>

{#if sentenceLength > length}
	{sentenceAsArray.slice(0, length).join(' ')}
	<slot />
{:else}
	{description}
{/if}
