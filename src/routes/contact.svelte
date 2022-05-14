<script context="module">
	//export const prerender = false;
</script>

<section>
	<div>
		<form name="contact" method="POST" action="/" data-netlify="true">
			<input type="hidden" name="form-name" value="contact" />
			<input type="hidden" name="subject" value="General Inquiry from NOTBFireworks.com" />
			<p>
				<label>Name: <input type="text" name="name" /></label>
			</p>
			<p>
				<label>Your Email: <input type="email" name="email" /></label>
			</p>
			<p>
				<label>Message: <textarea name="message" value="12:36 test with prerender on" /></label>
			</p>
			<p>
				<button type="submit">Send</button>
			</p>
		</form>
	</div>
</section>

<style>
</style>
