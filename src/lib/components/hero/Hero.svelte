<div class="hero">
	<div class="message">
		<img src="logo_tall.png" alt="tall notb fireworks logo" />
		<div>
			<h1 class="title">north of the border<br /><span class="fireworks">fireworks</span></h1>
			<div class="deals everything">all items</div>
			<div class="deals rotate">
				<span class="deal _2for">2 for 1</span>
				<br />
				or <span class="deal _3for">3 for 1</span>
			</div>
		</div>
	</div>
</div>

<style>
	h1 {
		margin-bottom: 0;
	}
	.fireworks {
		font-size: 2.5em;
		text-transform: lowercase;
	}
	.hero {
		width: 100%;
		height: calc(100vh - 60px);
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero-bg.jpg');
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.message {
		color: white;
		display: flex;
	}
	img {
		height: 20rem;
	}
	@media only screen and (max-width: 768px) {
		img {
			display: none;
		}
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
	.deal {
		display: inline-block;
		padding: 0.05em 1em 0.05em 1em;
		margin: 0.05em;
		border-radius: 0.125em;
		background-color: rgb(0, 0, 0);
		box-shadow: 14px 14px 29px -1px rgba(0, 0, 0, 0.9);
		font-weight: bolder;
	}
	._2for {
		background-color: var(--red);
	}
	._3for {
		background-color: var(--yellow);
		color: var(--grey);
	}
	.everything {
		transform: translateY(-10px);
		position: relative;
		z-index: 1;
	}
</style>
