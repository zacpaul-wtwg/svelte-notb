<script>
	import Address from '$lib/components/Address.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
</script>

<TitleBar
	title={'Contact Us'}
	description={'Contact us for any questions you may have, inventory queries, or state and federal laws regarding consumer fireworks.'}
/>

<Container>
	<div class="display">
		<Address />
		<form name="contact" method="POST" action="/submit" data-netlify="true">
			<input type="hidden" name="form-name" value="contact" />
			<input type="hidden" name="subject" value="General Inquiry from NOTBFireworks.com" />
			<p>
				<label for="name">Name: </label>
				<br /><input id="name" type="text" name="name" />
			</p>
			<p>
				<label for="email">Your Email: </label>
				<br /><input id="email" type="email" name="email" />
			</p>
			<p>
				<label for="message">Message: </label>
				<br /><textarea id="message" name="message"></textarea>
			</p>
			<p>
				<Button>Send</Button>
			</p>
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
	div {
		max-width: 1024px;
		display: inline-block;
	}
	form {
		width: 750px;
		input,
		textarea {
			width: 100%;
		}
	}
	.display {
		display: flex;
		flex-wrap: wrap;
	}
	iframe {
		margin-top: 2em;
	}
</style>
