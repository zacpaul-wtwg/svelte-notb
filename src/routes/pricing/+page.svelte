<script>
import Container from '$lib/components/elements/Container.svelte';
import PageTitle from '$lib/components/PageTitle.svelte';
import TitleBar from '$lib/components/TitleBar.svelte';
import { renderMarkdown } from '$lib/markdown';
import { fallbackAllData } from '$lib/cms/fallback';

export let data;
$: allData = data?.allData ?? fallbackAllData;

const decorateHeadings = (html) =>
	html.replace(/<h4>([^<]+)<\/h4>/g, (match, text) => {
		const key = text.trim().toLowerCase();
		if (key === 'highlights') return '';
		const cls =
			key === 'how it works'
				? 'section-head how'
				: key === 'best for'
					? 'section-head best'
					: 'section-head';
		return `<h3 class="${cls}">${text}</h3>`;
	});

</script>

<TitleBar
	title={'Pricing'}
	description={'See our vip loyalty program, high roller rollback program, and camp and military discount information'}
/>
<Container>
	<section class="pricing-hero">
		<div class="hero-strip">
			<div class="hero-badge">
				<span class="badge-title">VIP</span>
				<span class="badge-sub">Bonus + rewards</span>
			</div>
			<div class="hero-badge">
				<span class="badge-title">High Roller</span>
				<span class="badge-sub">3‑for‑1 pricing</span>
			</div>
			<div class="hero-badge">
				<span class="badge-title">Camp Days</span>
				<span class="badge-sub">Credentials required</span>
			</div>
			<div class="hero-badge">
				<span class="badge-title">Military</span>
				<span class="badge-sub">10% discount</span>
			</div>
		</div>
		<div class="hero-compare">
			<div class="compare-label">Relative Savings</div>
			<div class="compare-bars">
				<div class="bar-row">
					<span>Standard</span>
					<div class="bar"><span style="width: 45%"></span></div>
				</div>
				<div class="bar-row">
					<span>VIP</span>
					<div class="bar"><span style="width: 70%"></span></div>
				</div>
				<div class="bar-row">
					<span>High Roller</span>
					<div class="bar"><span style="width: 95%"></span></div>
				</div>
			</div>
		</div>
	</section>

	<section class="pricing-stack">
		{#each allData.pricing as entry}
			<article class="pricing-card">
				<header class="card-header">
					<h3>{entry.title}</h3>
					<span class="card-kicker">Program Overview</span>
				</header>
				<div class="card-body">
					<div class="md">{@html decorateHeadings(renderMarkdown(entry.entry))}</div>
				</div>
			</article>
		{/each}
	</section>
</Container>

<style>
	.md > :global(ul) {
		list-style: disc;
		padding-left: 2em;
	}
	.pricing-hero {
		display: grid;
		grid-template-columns: 2fr 1.2fr;
		gap: 1.2em;
		margin-bottom: 1.6em;
	}
	.hero-strip {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.8em;
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		padding: 0.9em;
	}
	.hero-badge {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		background: var(--grey);
		color: var(--white);
		padding: 0.6em 0.7em;
		border-radius: 0;
		box-shadow: inset 0 -2px 0 rgba(255, 255, 255, 0.1);
	}
	.badge-title {
		font-family: Langdon, Arial, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.95em;
	}
	.badge-sub {
		font-size: 0.8em;
		color: var(--yellow-accent);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.hero-compare {
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		padding: 0.9em 1em;
		display: flex;
		flex-direction: column;
		gap: 0.8em;
	}
	.compare-label {
		font-family: Langdon, Arial, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--grey);
	}
	.compare-bars {
		display: flex;
		flex-direction: column;
		gap: 0.6em;
	}
	.bar-row {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: 0.6em;
		align-items: center;
		font-size: 0.85em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--grey);
	}
	.bar {
		background: var(--grey-light);
		height: 10px;
		position: relative;
		border: 1px solid var(--grey);
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--grey);
	}
	.pricing-stack {
		display: flex;
		flex-direction: column;
		gap: 1.2em;
	}
	.pricing-card {
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}
	.card-header {
		background: var(--grey);
		color: var(--white);
		padding: 0.6em 0.9em;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-bottom: 2px solid var(--white);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
	}
	.card-header h3 {
		margin: 0;
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.2em;
	}
	.card-kicker {
		font-size: 0.75em;
		color: var(--yellow-accent);
		letter-spacing: 0.05em;
	}
	.card-body {
		padding: 0.9em 1em 1.1em;
		color: var(--grey);
		overflow: hidden;
	}
	.card-body :global(h3) {
		margin: 1em 0 0.4em;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.95em;
		color: var(--grey);
		border-bottom: 1px solid var(--grey);
		padding-bottom: 0.25em;
	}
	.section-head {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
	}
	.section-head::before {
		content: '';
		width: 16px;
		height: 16px;
		display: inline-block;
		background-color: var(--yellow-accent);
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
	}
	.section-head.how::before {
		-webkit-mask-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z%22 fill=%22black%22/%3E%3C/svg%3E');
		mask-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z%22 fill=%22black%22/%3E%3C/svg%3E');
	}
	.section-head.best::before {
		-webkit-mask-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M12 3l3 6 6 .9-4.5 4.4 1.1 6.4L12 17.8 6.4 20.7l1.1-6.4L3 9.9 9 9l3-6z%22 fill=%22black%22/%3E%3C/svg%3E');
		mask-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M12 3l3 6 6 .9-4.5 4.4 1.1 6.4L12 17.8 6.4 20.7l1.1-6.4L3 9.9 9 9l3-6z%22 fill=%22black%22/%3E%3C/svg%3E');
	}
	.card-body :global(p) {
		margin: 0 0 0.8em 0;
		line-height: 1.5;
	}
	.card-body :global(ul) {
		margin: 0.4em 0 0.8em;
		padding-left: 0;
		list-style: none;
		padding-left: 1.2em;
	}
	.card-body :global(li) {
		margin: 0.35em 0;
		padding: 0.4em 1em 0.4em 3.2em;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--grey);
		box-shadow: 4px 4px 0 var(--yellow-accent);
		position: relative;
		left: -2.7em;
		display: block;
		width: max-content;
		transform: skew(-14deg);
		border-radius: 0 6px 6px 0;
	}
	@media (max-width: 640px) {
		.card-body :global(li) {
			width: auto;
			max-width: 100%;
		}
	}
	.card-body :global(li > *) {
		display: inline-block;
		transform: skew(14deg);
		color: var(--white);
		position: relative;
		z-index: 1;
	}
	.card-body :global(li strong) {
		color: var(--white);
	}
	.card-body :global(strong) {
		color: var(--black, #000);
	}
	@media (max-width: 980px) {
		.hero-strip {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 640px) {
		.pricing-hero {
			grid-template-columns: 1fr;
		}
		.card-header {
			padding: 0.5em 0.8em;
		}
		.card-body {
			padding: 0.8em 0.9em 1em;
		}
	}
</style>
