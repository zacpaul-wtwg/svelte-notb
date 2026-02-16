<script>
	// Static hero lockup only.
	import ButtonLink from '$lib/components/elements/ButtonLink.svelte';
</script>

<div class="hero">
	<div class="hero-lockup-bounds">
		<section class="hero-lockup" aria-label="Deal lockup">
			<header class="lockup-header">
				<span>ALL ITEMS</span>
			</header>

			<div class="lockup-panels">
				<div class="panel panel-deals">
					<div class="label-stack deal-pair" aria-label="Hero deal labels">
						<div class="hero-deal hero-deal-red"><span>2 FOR 1</span></div>
						<div class="or-badge" aria-hidden="true"><span>OR</span></div>
						<div class="hero-deal hero-deal-yellow"><span>3 FOR 1</span></div>
					</div>
				</div>
			</div>
		</section>
		<div class="hero-cta">
			<ButtonLink destination="/product" label="Go to Products" />
		</div>
	</div>
</div>

<style>
	.hero {
		--panel-height: clamp(220px, 30vw, 360px);
		width: 100%;
		min-height: calc(100vh - 60px);
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero-bg.jpg');
		background-position: center;
		background-size: cover;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.75rem;
		box-sizing: border-box;
		overflow: visible;
	}

	.hero-lockup {
		width: min(940px, 100%);
		position: relative;
	}

	.hero-lockup-bounds {
		width: auto;
		position: relative;
	}

	.hero-cta {
		display: flex;
		justify-content: center;
	}

	:global(.hero-cta a),
	:global(.hero-cta a:visited) {
		background: var(--grey);
		color: var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		text-decoration: none;
	}

	.lockup-header {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		color: var(--white);
		font-family: Langdon, Arial, sans-serif;
		font-size: clamp(2rem, 5vw, 3.6rem);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		line-height: 0.82;
		white-space: nowrap;
		margin-bottom: 3px;
	}

	.lockup-panels {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.panel {
		overflow: visible;
	}

	.panel-deals {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.label-stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 50px;
	}

	.deal-pair {
		position: relative;
	}

	.hero-deal {
		margin: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--grey);
		color: var(--white);
		border: 1px solid var(--white);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		transform: skew(-14deg);
		min-height: clamp(2.9rem, 5.8vw, 4.7rem);
		padding: 0 1.05rem;
		font-family: Langdon, Arial, sans-serif;
		font-size: clamp(2rem, 4.4vw, 3.6rem);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		line-height: 0;
	}

	.hero-deal span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		transform: skew(14deg) translateY(-0.06em);
	}

	.hero-deal-red {
		background: var(--red);
		color: var(--white);
		transform: translateX(-15px) skew(-14deg);
	}

	.hero-deal-yellow {
		background: var(--yellow);
		color: var(--grey);
		transform: translateX(15px) skew(-14deg);
	}

	.or-badge {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 54px;
		height: 54px;
		border-radius: 50%;
		background: var(--grey);
		color: var(--white);
		border: 2px solid var(--white);
		box-shadow: 4px 4px 0 var(--yellow-accent);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: Langdon, Arial, sans-serif;
		font-size: 1rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		line-height: 0;
		z-index: 2;
		pointer-events: none;
	}

	.or-badge span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		transform: translateY(-0.05em);
	}

	@media (max-width: 1024px) {
		.hero {
			--panel-height: clamp(180px, 27vw, 290px);
		}
	}

	@media (max-width: 700px) {
		.hero {
			--panel-height: 160px;
			padding: 0 0.5rem;
		}

		.lockup-header {
			font-size: 2rem;
			margin-bottom: 2px;
		}

		.lockup-panels {
			gap: 0;
		}

		.label-stack {
			gap: 34px;
		}

		.hero-deal {
			min-height: 2.35rem;
			padding: 0 0.62rem;
			font-size: 2rem;
			box-shadow: 4px 4px 0 var(--yellow-accent);
		}

		.hero-deal-red {
			transform: translateX(-10px) skew(-14deg);
		}

		.hero-deal-yellow {
			transform: translateX(10px) skew(-14deg);
		}

		.or-badge {
			width: 40px;
			height: 40px;
			font-size: 0.82rem;
			box-shadow: 3px 3px 0 var(--yellow-accent);
		}
	}
</style>
