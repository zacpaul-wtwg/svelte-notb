<script>
	import Address from '$lib/components/Address.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import { fallbackAllData } from '$lib/cms/fallback';

	export let data;
	$: allData = data?.allData ?? fallbackAllData;
</script>

<TitleBar
	title={'Contact Us'}
	description={'Contact us for any questions you may have, inventory queries, or state and federal laws regarding consumer fireworks.'}
/>

<Container>
	<div class="display">
		<div class="contact-card">
			<div class="card-header">
				<h2>Store Info</h2>
			</div>
			<div class="card-body">
				<Address showHours hours={allData.hours} />
			</div>
		</div>
		<form class="contact-card form-card" name="contact" method="POST" action="/submit" data-netlify="true">
			<input type="hidden" name="form-name" value="contact" />
			<input type="hidden" name="subject" value="General Inquiry from NOTBFireworks.com" />
			<div class="card-header">
				<h2>Send A Message</h2>
			</div>
			<div class="card-body form-body">
				<label for="name">Name</label>
				<input id="name" type="text" name="name" />
				<label for="email">Email</label>
				<input id="email" type="email" name="email" />
				<label for="message">Message</label>
				<textarea id="message" name="message" rows="6"></textarea>
				<div class="form-actions">
					<Button>Send</Button>
				</div>
			</div>
		</form>
	</div>

	<iframe
		title="Google Map location of NOTB Fireworks"
		src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58549.477868478614!2d-75.20533079338747!3d41.47115060997673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c4b035154a07bd%3A0xa98135bf82797b39!2sNorth%20of%20the%20Border%20Fireworks!5e0!3m2!1sen!2sus!4v1655396333859!5m2!1sen!2sus"
		width="100%"
		height="450"
		style="border:0;"
		loading="lazy"
		referrerpolicy="no-referrer-when-downgrade"
	></iframe>
</Container>

<style lang="scss">
	.display {
		display: grid;
		grid-template-columns: minmax(260px, 1fr) minmax(320px, 2fr);
		gap: 2em;
		align-items: start;
	}
	.contact-card {
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
	}
	.form-body {
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
		margin-top: 2em;
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
	}
	@media (max-width: 900px) {
		.display {
			grid-template-columns: 1fr;
		}
	}
</style>
