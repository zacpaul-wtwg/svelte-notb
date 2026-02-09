<script>
	import Address from '$lib/components/Address.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import NavPillButton from '$lib/components/elements/NavPillButton.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { fallbackAllData } from '$lib/cms/fallback';

	export let data;
	$: allData = data?.allData ?? fallbackAllData;
</script>

<TitleBar
	title={'Contact Us'}
	description={'Contact us for any questions you may have, inventory queries, or state and federal laws regarding consumer fireworks.'}
/>
<SectionHeader
	id="contact-page-title-label"
	place="-50"
	as="h1"
	text="Contact"
	size="large"
	className="contact-page-title"
/>

<Container>
	<section class="page-stack contact-page">
		<section class="contact-option">
			<SectionHeader
				id="contact-card-mini-label"
				as="h2"
				text="Store Info & Message"
				size="mini"
				place={-35}
				className="contact-option-label"
			/>
			<article class="contact-card">
				<div class="card-body">
					<section class="section section-info">
						<Address showHours hours={allData.hours} />
					</section>
					<section class="section section-message">
						<form
							class="contact-form"
							name="contact"
							method="POST"
							action="/submit"
							data-netlify="true"
							netlify-honeypot="bot-field"
						>
							<input type="hidden" name="form-name" value="contact" />
							<p class="sr-only">
								<label for="bot-field">Do not fill this out if you're human:</label>
								<input id="bot-field" name="bot-field" />
							</p>
							<input type="hidden" name="subject" value="General Inquiry from NOTBFireworks.com" />
							<label for="name">Name</label>
							<input id="name" type="text" name="name" />
							<label for="email">Email</label>
							<input id="email" type="email" name="email" />
							<label for="message">Message</label>
							<textarea id="message" name="message" rows="6"></textarea>
							<div class="form-actions">
								<NavPillButton type="submit" size="large">Send</NavPillButton>
							</div>
						</form>
					</section>
				</div>
			</article>
		</section>

		<iframe
			title="Google Map location of NOTB Fireworks"
			src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58549.477868478614!2d-75.20533079338747!3d41.47115060997673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c4b035154a07bd%3A0xa98135bf82797b39!2sNorth%20of%20the%20Border%20Fireworks!5e0!3m2!1sen!2sus!4v1655396333859!5m2!1sen!2sus"
			width="100%"
			height="450"
			style="border:0;"
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
		></iframe>
	</section>
</Container>

<style lang="scss">
	:global(.main .title-container) {
		visibility: hidden;
		pointer-events: none;
	}
	:global(.contact-page-title) {
		margin-top: -0.9rem;
		margin-bottom: calc(0.6rem - 34px);
		position: relative;
		top: -34px;
		z-index: 4;
		overflow: visible;
	}
	:global(.contact-page-title .label) {
		box-shadow: 6px 10px 0 var(--yellow-accent);
	}
	.contact-page {
		margin-bottom: 1.4rem;
	}
	.contact-option {
		display: flex;
		flex-direction: column;
	}
	:global(.contact-option-label) {
		margin-top: 0;
		margin-bottom: 0.45rem;
	}
	.contact-card {
		border: 2px solid var(--grey);
		background: var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		min-width: 0;
	}
	.card-body {
		padding: 1.1em 1.2em 1.4em;
	}
	.section {
		margin-top: 0.9em;
	}
	.section:first-child {
		margin-top: 0;
	}
	.section-info {
		order: 1;
	}
	.section-message {
		order: 2;
	}
	.contact-form {
		display: grid;
		gap: 0.75em;
	}
	label {
		font-family: Langdon, Arial, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--grey);
	}
	input,
	textarea {
		width: 100%;
		border: 2px solid var(--grey);
		background: var(--off-white);
		padding: 0.55em 0.7em;
		font-family: inherit;
		box-sizing: border-box;
	}
	textarea {
		resize: vertical;
		min-height: 140px;
	}
	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 0.5em;
	}
	iframe {
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
	}
	@media (min-width: 701px) {
		.card-body {
			display: grid;
			grid-template-columns: minmax(420px, 7fr) minmax(220px, 3fr);
			gap: 1.25rem;
			align-items: start;
		}
		.section {
			margin-top: 0;
		}
		.section-info {
			order: 2;
		}
		.section-message {
			order: 1;
		}
	}
	@media (max-width: 1024px) {
		.card-body {
			padding: 0.95em 0.9em 1.1em;
		}
	}
</style>
