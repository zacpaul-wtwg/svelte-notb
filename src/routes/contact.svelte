<script context="module">
	export const prerender = false;
</script>

<section>
	<form name="contact" method="POST" action="/" data-netlify="true">
		<input type="hidden" name="subject" value="General Inquiry from NOTBFireworks.com" />
		<p>
			<label>1 Name: <input type="text" name="name" /></label>
		</p>
		<p>
			<label>Your Email: <input type="email" name="email" /></label>
		</p>
		<p>
			<label>Message: <textarea name="message" /></label>
		</p>
		<p>
			<button type="submit">Send</button>
		</p>
	</form>
</section>
