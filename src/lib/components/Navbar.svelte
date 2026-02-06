<script>
	import { onMount } from 'svelte';

	// Show mobile icon and display menu
	let showMobileMenu = false;

	// List of navigation items
	const navItems = [
		{ label: 'Home', href: 'https://notbfireworks.com' },
		{ label: 'Products', href: '/product' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'FAQ', href: '/faq' },
		{ label: 'Contact', href: '/contact' }
	];

	// Mobile menu click event handler
	const handleMobileIconClick = () => (showMobileMenu = !showMobileMenu);
	const removeMobileMenu = function () {
		if (showMobileMenu) {
			showMobileMenu = !showMobileMenu;
		}
	};

	// Media match query handler
	const mediaQueryHandler = (e) => {
		// Reset mobile state
		if (!e.matches) {
			showMobileMenu = false;
		}
	};

	// Attach media query listener on mount hook
	onMount(() => {
		const mediaListener = window.matchMedia('(max-width: 767px)');

		mediaListener.addListener(mediaQueryHandler);
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
		<a href="/"><img src="/logo_large.png" alt="North of the Border Logo" /></a>
		<button
			type="button"
			class={`mobile-icon${showMobileMenu ? ' active' : ''}`}
			aria-label="Toggle navigation"
			on:click={handleMobileIconClick}
		>
			<div class="middle-line"></div>
		</button>
		<ul class={`navbar-list${showMobileMenu ? ' mobile' : ''}`}>
			{#each navItems as item}
				<li>
					<a href={item.href} on:click={removeMobileMenu}>{item.label}</a>
				</li>
			{/each}
		</ul>
	</div>
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
		a {
			color: white;
		}
		:after {
			margin: 10px;
		}
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

	.mobile-icon {
		width: 25px;
		height: 14px;
		position: relative;
		cursor: pointer;
		background: transparent;
		border: 0;
		padding: 0;
	}

	.mobile-icon:after,
	.mobile-icon:before,
	.middle-line {
		content: '';
		position: absolute;
		width: 100%;
		height: 2px;
		background-color: #fff;
		transition: all 0.4s;
		transform-origin: center;
	}

	.mobile-icon:before,
	.middle-line {
		top: 0;
	}

	.mobile-icon:after,
	.middle-line {
		bottom: 0;
	}

	.mobile-icon:before {
		width: 100%;
	}

	.mobile-icon:after {
		width: 100%;
	}

	.middle-line {
		margin: auto;
	}

	.mobile-icon:hover:before,
	.mobile-icon:hover:after,
	.mobile-icon.active:before,
	.mobile-icon.active:after,
	.mobile-icon.active .middle-line {
		width: 100%;
	}

	.mobile-icon.active:before,
	.mobile-icon.active:after {
		top: 50%;
		transform: rotate(-45deg);
	}

	.mobile-icon.active .middle-line {
		transform: rotate(45deg);
	}

	.navbar-list {
		display: none;
		width: 100%;
		justify-content: space-between;
		margin: 0;
		padding: 0 40px;
	}

	.navbar-list.mobile {
		background-color: var(--grey);
		position: fixed;
		display: block;
		height: calc(100% - 60px);
		bottom: 0;
		left: 0;
	}

	.navbar-list li {
		list-style-type: none;
		position: relative;
	}

	.navbar-list li:before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 1px;
		background-color: var(--off-white);
	}

	.navbar-list a {
		color: #fff;
		text-decoration: none;
		display: flex;
		height: var(--nav-height);
		align-items: center;
		padding: 0 10px;
		font-size: 13px;
	}

	@media only screen and (min-width: 767px) {
		.mobile-icon {
			display: none;
		}

		.navbar-list {
			display: flex;
			padding: 0;
		}

		.navbar-list a {
			display: inline-flex;
		}
	}

	.cart {
		height: 15px;
		margin-right: 0px;
	}
</style>
