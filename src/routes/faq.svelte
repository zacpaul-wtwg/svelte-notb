<script context="module">
	import Index from './index.svelte';
	export async function load({ fetch }) {
		const { allData } = await fetch('/data/getAllContentful.json').then((results) => {
			return results.json();
		});

		return {
			props: {
				allData
			}
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import Accordion from '$lib/components/accordion.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { sentenceify } from '$lib/utility/slugify';
	export let allData;

	onMount(() => {
		const scriptEl = document.createElement('script');
		scriptEl.setAttribute('type', 'application/ld+json');
		scriptEl.setAttribute('id', 'rsde');
		document.querySelector('head').appendChild(scriptEl);

		const generateFaq = function (objArray) {
			let faqString = '';
			let c;
			objArray.map((element, index) => {
				objArray.length === index + 1 ? (c = '') : (c = ',');
				faqString = `${faqString}{
					"@type": "Question",
					"name": "${element.title}",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "${sentenceify(element.answer)}"
					}
				}${c}`;
			});

			return faqString;
		};

		document.querySelector('#rsde').innerHTML = `
			{
				"@context": "https://schema.org",
				"@type": "FAQPage",
				"mainEntity": [
					${generateFaq(allData.faq)}
				]
			}
		`;
	});
</script>

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
