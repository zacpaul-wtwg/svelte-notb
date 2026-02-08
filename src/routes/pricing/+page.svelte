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
				<article class="pricing-card">
					<header class="card-header">
						<h3>{entry.title}</h3>
						<span class="card-kicker">Program Overview</span>
					</header>
					<div class="card-body">
						<p class="subtitle">{entry.subtitle}</p>
						<div class="section">
							<SectionHeader
								as="h4"
								text="Highlights"
								size="mini"
								fullBleed={false}
								showLines={false}
								className="pricing-mini-head"
							/>
							<ul class="highlights">
								{#each entry.highlights || [] as highlight}
									<li><SkewLabel as="span" text={highlight} /></li>
								{/each}
							</ul>
						</div>
						<div class="section">
							<SectionHeader
								as="h4"
								text="How It Works"
								size="mini"
								fullBleed={false}
								showLines={false}
								className="pricing-mini-head"
							/>
							<p>{entry.howItWorks}</p>
						</div>
						<div class="section">
							<SectionHeader
								as="h4"
								text="Best For"
								size="mini"
								fullBleed={false}
								showLines={false}
								className="pricing-mini-head"
							/>
							<p>{entry.bestFor}</p>
						</div>
					</div>
				</article>
			{/each}
		</section>
	</section>
</Container>

<style>
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
	}
	.section {
		margin-top: 0.9em;
	}
	:global(.pricing-mini-head) {
		margin: 0 0 0.5rem 0;
		padding: 0;
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
		.card-header {
			padding: 0.5em 0.8em;
		}
		.card-body {
			padding: 0.8em 0.9em 1em;
		}
	}
</style>
