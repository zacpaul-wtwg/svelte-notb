<script context="module">
	// `allData` is provided by `src/routes/__layout.svelte`.
</script>

<script>
	import { onMount } from 'svelte';
	import Accordion from '$lib/components/accordion.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { fallbackAllData } from '$lib/cms/fallback';
	export let allData = fallbackAllData;

	onMount(() => {
		const scriptEl = document.createElement('script');
		scriptEl.setAttribute('type', 'application/ld+json');
		scriptEl.setAttribute('id', 'structured-content');
		document.querySelector('head').appendChild(scriptEl);

		const structuredData = {};
		structuredData['@context'] = 'https://schema.org';
		structuredData['@type'] = 'FAQPage';

		console.log(structuredData);
		const mainEntity = function (objArray) {
			let array = [];
			objArray.map((element) => {
				//instantiate objects for additionw
				let objects = {};
				let acceptedAnswer = {};
				objects['@type'] = 'Question';
				objects.name = element.title;
				acceptedAnswer['@type'] = 'Answer';
				acceptedAnswer.text = element.answer;

				objects.acceptedAnswer = acceptedAnswer;
				console.log(array);
				array.push(objects);
			});

			return array;
		};

		structuredData.mainEntity = mainEntity(allData.faq);

		document.querySelector('#structured-content').innerHTML = JSON.stringify(structuredData);
	});
</script>

<svelte:head />

<TitleBar
	title={'Frequently Asked Questions'}
	description={'Frequently asked questions about the PA state laws, the safe use of fireworks, our pricing options, and more.'}
/>

<Container>
	<section>
		{#each allData.faq as entry}
			<article>
				<Accordion title={entry.title} answer={entry.answer} />
			</article>
		{/each}
	</section>
</Container>
