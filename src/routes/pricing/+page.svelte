<script>
	import Container from '$lib/components/elements/Container.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import SkewLabel from '$lib/components/SkewLabel.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { fallbackAllData } from '$lib/cms/fallback';

	export let data;
	$: allData = data?.allData ?? fallbackAllData;
</script>

<TitleBar
	title={'Pricing'}
	description={'See our vip loyalty program, high roller rollback program, and camp and military discount information'}
/>
<SectionHeader as="h1" text="Pricing" size="large" className="pricing-page-title" />
<Container>
	<section class="page-stack pricing-page">
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
				<section class="pricing-option">
					<SectionHeader
						as="h3"
						text={entry.title}
						size="mini"
						place={-35}
						showLines={true}
						fullBleed={false}
						className="pricing-option-label"
					/>
					<article class="pricing-card">
						<div class="card-body">
							<p class="subtitle">{entry.subtitle}</p>
							<div class="section">
								<h4 class="section-head">Highlights</h4>
								<ul class="highlights">
									{#each entry.highlights || [] as highlight}
										<li><SkewLabel as="span" text={highlight} /></li>
									{/each}
								</ul>
							</div>
							<div class="section">
								<h4 class="section-head how">How It Works</h4>
								<p>{entry.howItWorks}</p>
							</div>
							<div class="section">
								<h4 class="section-head best">Best For</h4>
								<p>{entry.bestFor}</p>
							</div>
						</div>
					</article>
				</section>
			{/each}
		</section>
	</section>
</Container>

<style>
	:global(.main .title-container) {
		visibility: hidden;
		pointer-events: none;
	}
	:global(.pricing-page-title) {
		margin-top: calc(-0.9rem - 50px);
		margin-bottom: 0.6rem;
	}
	.subtitle {
		margin: 0 0 0.8em 0;
		font-size: 0.98em;
	}
	.pricing-hero {
		display: grid;
		grid-template-columns: 2fr 1.2fr;
		gap: 1.2em;
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
	.pricing-option {
		display: flex;
		flex-direction: column;
	}
	:global(.pricing-option-label) {
		margin-top: 0;
		margin-bottom: 0.45rem;
	}
	.pricing-card {
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		display: flex;
		flex-direction: column;
		min-height: 100%;
		border-radius: 14px;
		overflow: hidden;
	}
	.card-body {
		padding: 0.9em 1em 1.1em;
		color: var(--grey);
	}
	.section {
		margin-top: 0.9em;
	}
	.section-head {
		margin: 0 0 0.4em;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.9em;
		color: var(--grey);
		border-bottom: 1px solid var(--grey);
		padding-bottom: 0.25em;
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
	.card-body p {
		margin: 0 0 0.6em 0;
		line-height: 1.5;
	}
	.highlights {
		margin: 0.4em 0 0.8em;
		padding-left: 0;
		list-style: none;
		padding-left: 1.2em;
	}
	.highlights li {
		margin: 0.35em 0;
		position: relative;
		left: -2.7em;
		width: max-content;
	}
	@media (max-width: 700px) {
		.card-body :global(li) {
			width: auto;
			max-width: 100%;
		}
	}
	.highlights li :global(.skew-label) {
		padding-left: 3.2em;
	}
	@media (max-width: 1024px) {
		.hero-strip {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 700px) {
		.pricing-hero {
			grid-template-columns: 1fr;
		}
		.card-body {
			padding: 0.8em 0.9em 1em;
		}
	}
</style>
