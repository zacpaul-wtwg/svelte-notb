<script>
	import Address from '$lib/components/Address.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
</script>

<TitleBar title={'Contact Us'} />

<Container>
	<div class="display">
		<Address />
		<form name="contact" method="POST" action="/submit" data-netlify="true">
			<input type="hidden" name="form-name" value="contact" />
			<input type="hidden" name="subject" value="General Inquiry from NOTBFireworks.com" />
			<p>
				<label for="name">Name: </label>
				<br /><input type="text" name="name" />
			</p>
			<p>
				<label for="email">Your Email: </label>
				<br /><input type="email" name="email" />
			</p>
			<p>
				<label for="message">Message: </label>
				<br /><textarea name="message" />
			</p>
			<p>
				<Button>Send</Button>
			</p>
		</form>
	</div>
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
</style>
