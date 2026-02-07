<script>
	import { onMount, tick } from 'svelte';
	import Accordion from '$lib/components/accordion.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { fallbackAllData } from '$lib/cms/fallback';

export let data;
$: allData = data?.allData ?? fallbackAllData;
let openIndex = 0;
let cardEls = [];
const getNavOffset = () => {
	if (typeof window === 'undefined') return 0;
	const nav = document.querySelector('nav');
	if (!nav) return 0;
	const height = nav.getBoundingClientRect().height || 0;
	return height + 8;
};
const scrollToHeader = (index) => {
	const button = cardEls[index]?.querySelector('.summary');
	if (!button) return;
	const top = button.getBoundingClientRect().top + window.scrollY - getNavOffset();
	window.scrollTo({ top, behavior: 'smooth' });
};
const handleToggle = async (index) => {
	if (openIndex === index) {
		openIndex = -1;
		return;
	}
	openIndex = -1;
	await tick();
	setTimeout(() => {
		scrollToHeader(index);
		requestAnimationFrame(() => {
			openIndex = index;
		});
	}, 260);
};

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
	<section class="faq-stack">
		{#each allData.faq as entry, i}
			<article class="faq-card" bind:this={cardEls[i]}>
				<Accordion
					title={entry.title}
					answer={entry.answer}
					open={openIndex === i}
					onToggle={() => handleToggle(i)}
				/>
			</article>
		{/each}
	</section>
</Container>

<style>
	.faq-stack {
		display: flex;
		flex-direction: column;
		gap: 1.2em;
	}
	.faq-card {
		display: block;
	}
</style>
