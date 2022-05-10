<script>
	import ButtonLink from '$lib/components/ButtonLink.svelte';
</script>

<div class="hero">
	<div class="message">
		<img src="logo_tall.png" alt="tall notb fireworks logo" />
		<div>
			<h1 class="title">north of the border<br /><span class="fireworks">fireworks</span></h1>
			<div class="deals everything">all items</div>
			<div class="deals rotate">
				<div class="red-ribbon">
					<div class="red-ribbon-content"><p><b>2 FOR 1</b></p></div>
				</div>
				<br />
				<span class="or">or</span>
				<div class="yellow-ribbon">
					<div class="yellow-ribbon-content"><p><b>3 FOR 1</b></p></div>
				</div>
			</div>
		</div>
	</div>
	<ButtonLink destination={'products'} label={'Go to Products'} />
</div>

<style>
	h1 {
		margin-bottom: 0;
	}
	img {
		height: 20rem;
	}
	.fireworks {
		font-size: 2.5em;
		text-transform: lowercase;
	}
	.hero {
		width: 100%;
		height: calc(100vh - 60px);
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('hero-bg.jpg');
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.message {
		color: white;
		display: flex;
	}
	.deals {
		font-size: 2.5em;
		letter-spacing: 0.125em;
		font-family: langdon;
		text-transform: uppercase;
	}
	.rotate {
		transform: rotate(-7deg) translateY(-25px);
	}

	.everything {
		transform: translateY(-10px);
		position: relative;
		z-index: 1;
	}
	.or {
		transform: translateX(100px);
		display: inline-block;
		box-shadow: 14px 14px 31px 7px rgba(0, 0, 0, 0.77);
		font-weight: bolder;
	}
	.red-ribbon {
		margin-left: -150px;
	}
	.yellow-ribbon {
		margin-top: -7px;
	}

	@media only screen and (max-width: 768px) {
		img {
			display: none;
		}
	}
</style>
