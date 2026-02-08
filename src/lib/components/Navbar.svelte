<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let showMobileMenu = false;

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Products', href: '/product' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'FAQ', href: '/faq' },
		{ label: 'Contact', href: '/contact' }
	];

	const closeMobileMenu = () => {
		showMobileMenu = false;
	};

	const toggleMobileMenu = () => {
		showMobileMenu = !showMobileMenu;
	};

	onMount(() => {
		const mediaListener = window.matchMedia('(max-width: 700px)');
		const handleMediaChange = (event) => {
			if (!event.matches) showMobileMenu = false;
		};

		if (mediaListener.addEventListener) {
			mediaListener.addEventListener('change', handleMediaChange);
		} else {
			mediaListener.addListener(handleMediaChange);
		}

		return () => {
			if (mediaListener.removeEventListener) {
				mediaListener.removeEventListener('change', handleMediaChange);
			} else {
				mediaListener.removeListener(handleMediaChange);
			}
		};
	});
</script>

<nav>
	<div class="top inner">
		<div class="top-item"><a href="/product/pricelist">Pricelist</a></div>
		<div class="top-item">
			<a href="/product/wishlist"
				><img src="/cart.svg" alt="wishlist cart icon" class="svg-filter-white cart" /></a
			>
		</div>
	</div>
	<div class="hr"></div>
	<div class="bottom inner">
		<a class="logo-link" href="/" aria-label="North of the Border Home">
			<img src="/logo_large.png" alt="North of the Border Logo" />
		</a>
		<button
			type="button"
			class="menu-toggle"
			aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
			aria-expanded={showMobileMenu}
			on:click={toggleMobileMenu}
		>
			<span class={`menu-icon ${showMobileMenu ? 'open' : ''}`} aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
			</span>
		</button>
		<ul class="navbar-list desktop-nav">
			{#each navItems as item}
				<li>
					<a href={item.href}>{item.label}</a>
				</li>
			{/each}
		</ul>
	</div>

	{#if showMobileMenu}
		<button
			type="button"
			class="mobile-backdrop"
			aria-label="Close menu"
			on:click={closeMobileMenu}
			transition:fade={{ duration: 140 }}
		></button>
		<div
			class="mobile-panel"
			role="dialog"
			aria-label="Site navigation"
			transition:fly={{ y: -12, duration: 180 }}
		>
			<ul class="mobile-nav-list">
				{#each navItems as item}
					<li>
						<a href={item.href} on:click={closeMobileMenu}>{item.label}</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>

<style lang="scss">
	.top {
		display: flex;
		justify-content: flex-end;
		background: var(--grey);
		color: white;
		height: 20px;
	}

	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
	}

	.top-item {
		padding: 5px;
		margin-left: 10px;
		font-size: 0.9em;
		color: white;
	}

	.top-item a {
		color: white;
	}

	.hr {
		border-bottom: thin solid var(--grey-accent);
		margin: 10px;
	}

	img {
		height: 55px;
		margin-right: 50px;
	}

	nav {
		background-color: var(--grey);
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
		height: 100px;
		position: fixed;
		width: 100%;
		top: 0;
		z-index: 99;
	}

	.inner {
		max-width: 980px;
		padding-left: 20px;
		padding-right: 20px;
		margin: auto;
		box-sizing: border-box;
	}

	.logo-link {
		display: inline-flex;
		align-items: center;
	}

	.menu-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 34px;
		border: 1px solid var(--white);
		background: transparent;
		color: var(--white);
		box-shadow: 3px 3px 0 var(--yellow-accent);
		cursor: pointer;
		padding: 0;
	}

	.menu-icon {
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		width: 18px;
		height: 14px;
	}

	.menu-icon span {
		display: block;
		height: 2px;
		background: var(--white);
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
	}

	.menu-icon.open span:nth-child(1) {
		transform: translateY(6px) rotate(45deg);
	}

	.menu-icon.open span:nth-child(2) {
		opacity: 0;
	}

	.menu-icon.open span:nth-child(3) {
		transform: translateY(-6px) rotate(-45deg);
	}

	.desktop-nav {
		display: none;
	}

	.navbar-list {
		width: 100%;
		justify-content: space-between;
		margin: 0;
		padding: 0;
	}

	.navbar-list li,
	.mobile-nav-list li {
		list-style-type: none;
		position: relative;
	}

	.navbar-list a,
	.mobile-nav-list a {
		color: #fff;
		text-decoration: none;
		display: flex;
		height: var(--nav-height);
		align-items: center;
		padding: 0 10px;
		font-size: 13px;
		font-family: Langdon, Arial, sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.mobile-backdrop {
		position: fixed;
		left: 0;
		right: 0;
		top: 100px;
		bottom: 0;
		background: rgba(0, 0, 0, 0.35);
		border: 0;
		padding: 0;
		margin: 0;
		z-index: 98;
	}

	.mobile-panel {
		position: fixed;
		top: 100px;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--grey);
		z-index: 99;
		padding: 0.6rem 0.8rem 1rem;
		box-sizing: border-box;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.mobile-nav-list {
		margin: 0;
		padding: 0;
	}

	.mobile-nav-list li {
		border-bottom: 0;
	}

	.mobile-nav-list a {
		height: 50px;
		font-size: 1rem;
		padding: 0 0.75rem;
		margin: 0.45rem 0;
		border: 1px solid rgba(255, 255, 255, 0.85);
		box-shadow: 3px 3px 0 var(--yellow-accent);
		background: rgba(0, 0, 0, 0.24);
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			background 0.18s ease;
	}

	.mobile-nav-list a:hover,
	.mobile-nav-list a:focus-visible {
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0 var(--yellow-accent);
		background: rgba(0, 0, 0, 0.42);
		outline: none;
	}

	@media only screen and (min-width: 701px) {
		.menu-toggle {
			display: none;
		}

		.desktop-nav {
			display: flex;
		}

		.navbar-list a {
			display: inline-flex;
			height: 38px;
			padding: 0 0.75rem;
			border: 1px solid transparent;
			box-shadow: 0 0 0 transparent;
			transition:
				transform 0.18s ease,
				box-shadow 0.18s ease,
				border-color 0.18s ease,
				background 0.18s ease;
		}

		.navbar-list a:hover,
		.navbar-list a:focus-visible {
			background: rgba(0, 0, 0, 0.3);
			border-color: rgba(255, 255, 255, 0.85);
			box-shadow: 3px 3px 0 var(--yellow-accent);
			transform: translate(-1px, -1px);
			outline: none;
		}
	}

	.cart {
		height: 15px;
		margin-right: 0;
	}
</style>
