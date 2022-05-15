<script>
	import Faq from './faq.svelte';
	import Button from '$lib/components/elements/Button.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
</script>

<TitleBar title={'Form Submitted Successfully'} />

<Container>
	<div class="display">
		<address>
			<div class="aside-object">
				<h3>Phone:</h3>
				<a href="tel: 5072265111">(570) 226-5111</a>
			</div>
			<div class="aside-object">
				<h3>Address:</h3>
				<div>125 Welwood Ave</div>
				<div>Hawley, PA 18428</div>
			</div>
		</address>
		<div>
			<h2>Thank you for reaching out to North of the Border Fireworks</h2>
			<p>
				We will do everything we can to get back to you as soon as we can. Meanwhile, it is possible
				that your inquiry may have answers already posted on our website:
			</p>
			<hr />
			<h3>Frequently Asked Questions</h3>
			<p>
				Many answers can be found on our <a href="/faq">FAQ Page</a>. From how to light fireworks to
				some safety tips.
			</p>
			<hr />
			<h3>Pricing</h3>
			<p>
				If you have any questions about military discounts, loyalty programs, or general pricing
				information, our <a href="/pricing"> Pricing Page </a> may have the information you need.
			</p>
			<hr />
			<h3>Products</h3>
			<p>
				Our product page is now tied directly into our in-store inventory system. You can find
				up-to-date product information like, item price, effects, colors, sounds, and more on our
				<a href="/products"> Product Page</a>.
			</p>
		</div>
	</div>
</Container>

<style lang="scss">
	div {
		max-width: 1024px;
		display: inline-block;
	}
	address {
		display: flex;
		flex-direction: column;
		padding: 2em;
	}
	.display {
		display: flex;
		flex-wrap: wrap;
		> div {
			width: 750px;
		}
	}
	.aside-object {
		margin-bottom: 1em;
		div {
			display: block;
		}
	}
</style>
