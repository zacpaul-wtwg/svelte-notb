<script>
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
</script>

<TitleBar title={'Form Submitted Successfully'} />
<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>
<Container>
	<section class="page-stack submit-page">
		<div class="submit-layout">
			<article class="submit-card contact-card">
				<header class="card-header">
					<h2>Contact Info</h2>
				</header>
				<address class="card-body">
					<div class="aside-object">
						<h3>Phone</h3>
						<a href="tel: 5072265111">(570) 226-5111</a>
					</div>
					<div class="aside-object">
						<h3>Address</h3>
						<div>125 Welwood Ave</div>
						<div>Hawley, PA 18428</div>
					</div>
				</address>
			</article>
			<article class="submit-card message-card">
				<header class="card-header">
					<h2>Message Received</h2>
				</header>
				<div class="card-body">
					<p>
						Thank you for reaching out to North of the Border Fireworks. We will do everything we
						can to get back to you as soon as we can.
					</p>
					<p>Meanwhile, answers to common questions may already be available:</p>
					<hr />
					<h3>Frequently Asked Questions</h3>
					<p>
						Many answers can be found on our <a href="/faq">FAQ Page</a>. From how to light
						fireworks to some safety tips.
					</p>
					<hr />
					<h3>Pricing</h3>
					<p>
						If you have any questions about military discounts, loyalty programs, or general pricing
						information, our <a href="/pricing">Pricing Page</a> may have the information you need.
					</p>
					<hr />
					<h3>Products</h3>
					<p>
						Our product page is tied directly into our in-store inventory system. You can find
						up-to-date product information on our <a href="/product">Product Page</a>.
					</p>
				</div>
			</article>
		</div>
	</section>
</Container>

<style lang="scss">
	.submit-page {
		margin-bottom: 1.4rem;
	}

	.submit-layout {
		display: grid;
		grid-template-columns: minmax(260px, 1fr) minmax(320px, 2fr);
		gap: 2em;
		align-items: start;
	}

	.submit-card {
		border: 2px solid var(--grey);
		background: var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		min-width: 0;
	}

	.card-header {
		background: var(--grey);
		color: var(--white);
		padding: 0.5em 0.9em;
	}

	.card-header h2 {
		margin: 0;
		font-size: 1.1em;
		letter-spacing: 0.04em;
	}

	.card-body {
		padding: 1.1em 1.2em 1.4em;
		color: var(--grey);
	}

	.contact-card address {
		font-style: normal;
	}

	.aside-object {
		margin-bottom: 1em;
	}

	.aside-object h3 {
		margin: 0 0 0.35em 0;
		font-size: 0.95em;
	}

	.message-card p {
		margin: 0 0 0.85em 0;
		line-height: 1.55;
	}

	.message-card h3 {
		margin: 0.35em 0 0.35em;
		font-size: 1em;
	}

	@media (max-width: 900px) {
		.submit-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
