<script>
	import { onMount } from 'svelte';
	import { goto, preloadData } from '$app/navigation';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { openGlobalCompareModal } from '$lib/modal-store';
	import { fetchRuntimeCms } from '$lib/cms/runtime-client';

	let showMobileMenu = false;
	let pendingMobileHref = '';
	let mobileNavClickTimer;
	let navEl;
	let topRowEl;
	let bottomRowEl;
	let keyboardMode = false;
	const NAV_BUTTON_ANIMATION_MS = 100;
	const NAV_CLOSE_DELAY_MS = 150;
	const MOBILE_ACTIVE_WIDTH = 13.2;
	const MOBILE_INACTIVE_WIDTH = 9.9;
	const DESKTOP_FLOAT_X_PX = -5;
	const DESKTOP_FLOAT_Y_PX = -5;
	const DESKTOP_HOVER_ANIMATION_MS = 150;
	const mobileWidths = tweened({}, { duration: NAV_BUTTON_ANIMATION_MS, easing: cubicOut });
	const desktopHoverProgress = tweened({}, { duration: DESKTOP_HOVER_ANIMATION_MS, easing: cubicOut });
	const STORE_TIMEZONE = 'America/New_York';
	const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	let cmsHours = null;
	let hoursStatus = { label: 'Hours unavailable', detail: '', tone: 'closed' };

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Products', href: '/product' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'FAQ', href: '/faq' },
		{ label: 'Contact', href: '/contact' }
	];

	const closeMobileMenu = () => {
		showMobileMenu = false;
		pendingMobileHref = '';
		if (mobileNavClickTimer) {
			clearTimeout(mobileNavClickTimer);
			mobileNavClickTimer = undefined;
		}
	};

	const toggleMobileMenu = () => {
		showMobileMenu = !showMobileMenu;
	};

	const isActive = (href) => {
		const path = $page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(`${href}/`);
	};

	const isMobileActive = (href) => {
		if (pendingMobileHref) return pendingMobileHref === href;
		return isActive(href);
	};

	const getCurrentActiveHref = () => navItems.find((item) => isActive(item.href))?.href ?? '';

	const getWidthMap = (activeHref) =>
		Object.fromEntries(
			navItems.map((item) => [
				item.href,
				item.href === activeHref ? MOBILE_ACTIVE_WIDTH : MOBILE_INACTIVE_WIDTH
			])
		);

	const getMobileLinkStyle = (href, widthMap) => {
		const width =
			widthMap[href] ?? (isMobileActive(href) ? MOBILE_ACTIVE_WIDTH : MOBILE_INACTIVE_WIDTH);
		return `--mobile-pill-width:${width}rem`;
	};

	const getDesktopLinkStyle = (href, progressMap) => {
		const hoverProgress = progressMap[href] ?? 0;
		const activeProgress = isActive(href) ? 1 : 0;
		const progress = Math.max(hoverProgress, activeProgress);
		const liftX = DESKTOP_FLOAT_X_PX * progress;
		const liftY = DESKTOP_FLOAT_Y_PX * progress;
		return `--nav-float-x:${liftX}px;--nav-float-y:${liftY}px`;
	};

	const getClearedDesktopHoverMap = () =>
		Object.fromEntries(navItems.map((item) => [item.href, 0]));

	const setDesktopHover = (href, hovering) => {
		const current = get(desktopHoverProgress);
		const next = hovering
			? { ...getClearedDesktopHoverMap(), [href]: 1 }
			: { ...current, [href]: 0 };
		desktopHoverProgress.set(
			next,
			{ duration: DESKTOP_HOVER_ANIMATION_MS, easing: cubicOut }
		);
	};

	const clearDesktopHover = () => {
		desktopHoverProgress.set(getClearedDesktopHoverMap(), {
			duration: DESKTOP_HOVER_ANIMATION_MS,
			easing: cubicOut
		});
	};

	const handleDesktopFocus = (href) => {
		if (!keyboardMode) return;
		setDesktopHover(href, true);
	};

	const handleMobileNavClick = (event, href) => {
		event.preventDefault();
		event.stopPropagation();
		if (pendingMobileHref) return;
		pendingMobileHref = href;
		preloadData(href);
		mobileWidths.set(getWidthMap(href), { duration: NAV_BUTTON_ANIMATION_MS, easing: cubicOut });
		mobileNavClickTimer = setTimeout(async () => {
			showMobileMenu = false;
			if (!isActive(href)) {
				await goto(href);
			}
			pendingMobileHref = '';
			mobileNavClickTimer = undefined;
		}, NAV_CLOSE_DELAY_MS);
	};

	const handleCompareNavClick = (event) => {
		event.preventDefault();
		openGlobalCompareModal();
	};

	const parseTimeToMinutes = (value) => {
		const match = String(value || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
		if (!match) return null;
		return Number(match[1]) * 60 + Number(match[2]);
	};

	const formatClock = (time) => {
		const mins = parseTimeToMinutes(time);
		if (mins === null) return '';
		const hours24 = Math.floor(mins / 60);
		const minutes = mins % 60;
		const suffix = hours24 >= 12 ? 'PM' : 'AM';
		const hours12 = ((hours24 + 11) % 12) + 1;
		return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
	};

	const getNowInTimezone = (timeZone) => {
		const parts = new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23'
		}).formatToParts(new Date());
		const getPart = (type) => parts.find((p) => p.type === type)?.value || '';
		return {
			date: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
			time: `${getPart('hour')}:${getPart('minute')}`
		};
	};

	const parseIsoDate = (value) => {
		const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if (!match) return null;
		const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
		return Number.isNaN(date.getTime()) ? null : date;
	};

	const getHoursForDate = (cms, dateValue) => {
		const specialHours = Array.isArray(cms?.specialHours) ? cms.specialHours : [];
		for (const occasion of specialHours) {
			for (const day of Array.isArray(occasion?.days) ? occasion.days : []) {
				if (String(day?.date || '') === dateValue) return day;
			}
		}
		const date = parseIsoDate(dateValue);
		if (!date) return null;
		const regularRanges = Array.isArray(cms?.regularHoursRanges) ? cms.regularHoursRanges : [];
		const matching = regularRanges
			.filter((range) => {
				const start = parseIsoDate(range?.startDate);
				const end = parseIsoDate(range?.endDate);
				if (!start || !end || end < start) return false;
				return date >= start && date <= end;
			})
			.sort((a, b) => String(b?.startDate || '').localeCompare(String(a?.startDate || '')));
		if (!matching.length) return null;
		return matching[0]?.hours?.[weekdayKeys[date.getUTCDay()]] ?? null;
	};

	const computeHoursStatus = (cms) => {
		if (!cms) return { label: 'Hours unavailable', detail: '', tone: 'closed' };
		const now = getNowInTimezone(STORE_TIMEZONE);
		const current = parseTimeToMinutes(now.time);
		const hours = getHoursForDate(cms, now.date);
		if (!hours || hours.closed || !hours.open || !hours.close || current === null) {
			return { label: 'Closed today', detail: '', tone: 'closed' };
		}
		const open = parseTimeToMinutes(hours.open);
		const close = parseTimeToMinutes(hours.close);
		if (open === null || close === null) return { label: 'Closed today', detail: '', tone: 'closed' };
		if (current < open) {
			const minsUntilOpen = open - current;
			return minsUntilOpen <= 60
				? { label: 'Opens soon', detail: formatClock(hours.open), tone: 'soon' }
				: { label: 'Closed', detail: `Opens ${formatClock(hours.open)}`, tone: 'closed' };
		}
		if (current <= close) {
			const minsUntilClose = close - current;
			return minsUntilClose <= 60
				? { label: 'Closes soon', detail: formatClock(hours.close), tone: 'soon' }
				: { label: 'Open now', detail: `Until ${formatClock(hours.close)}`, tone: 'open' };
		}
		return { label: 'Closed', detail: 'See tomorrow', tone: 'closed' };
	};

	const syncNavVars = () => {
		if (!navEl || !bottomRowEl) return;
		const root = document.documentElement;
		const navTop = topRowEl ? topRowEl.getBoundingClientRect().height : 0;
		const navHeight = bottomRowEl.getBoundingClientRect().height;
		const headerHeight = navEl.getBoundingClientRect().height;
		const navBottom = Math.max(0, headerHeight - navTop);
		root.style.setProperty('--nav-top', `${Math.round(navTop)}px`);
		root.style.setProperty('--nav-height', `${Math.round(navHeight)}px`);
		root.style.setProperty('--nav-bottom', `${Math.round(navBottom)}px`);
		root.style.setProperty('--header', `${Math.round(headerHeight)}px`);
	};

	onMount(() => {
		mobileWidths.set(getWidthMap(getCurrentActiveHref()), { duration: 0 });
		desktopHoverProgress.set(Object.fromEntries(navItems.map((item) => [item.href, 0])), {
			duration: 0
		});
		syncNavVars();
		const navResizeObserver = new ResizeObserver(() => syncNavVars());
		if (navEl) navResizeObserver.observe(navEl);
		if (topRowEl) navResizeObserver.observe(topRowEl);
		if (bottomRowEl) navResizeObserver.observe(bottomRowEl);
		const mediaListener = window.matchMedia('(max-width: 700px)');
		const handleKeydown = (event) => {
			if (event.key === 'Tab') keyboardMode = true;
		};
		const handlePointerDown = () => {
			keyboardMode = false;
		};
		const handleMediaChange = (event) => {
			if (!event.matches) showMobileMenu = false;
			syncNavVars();
		};
		const refreshCmsHours = async () => {
			const latest = await fetchRuntimeCms();
			if (latest) cmsHours = latest;
			hoursStatus = computeHoursStatus(cmsHours);
		};
		window.addEventListener('resize', syncNavVars);
		window.addEventListener('keydown', handleKeydown);
		window.addEventListener('pointerdown', handlePointerDown);
		refreshCmsHours();
		const hoursStatusTimer = window.setInterval(() => {
			hoursStatus = computeHoursStatus(cmsHours);
		}, 60_000);

		if (mediaListener.addEventListener) {
			mediaListener.addEventListener('change', handleMediaChange);
		} else {
			mediaListener.addListener(handleMediaChange);
		}

		return () => {
			navResizeObserver.disconnect();
			window.removeEventListener('resize', syncNavVars);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('pointerdown', handlePointerDown);
			if (mediaListener.removeEventListener) {
				mediaListener.removeEventListener('change', handleMediaChange);
			} else {
				mediaListener.removeListener(handleMediaChange);
			}
			window.clearInterval(hoursStatusTimer);
		};
	});

	$: if (showMobileMenu && !pendingMobileHref) {
		mobileWidths.set(getWidthMap(getCurrentActiveHref()), { duration: 0 });
	}
</script>

<nav bind:this={navEl}>
	<div class="top inner" bind:this={topRowEl}>
		<div class="top-left">
			<div class="top-item top-item-hours">
				<div class={`utility-chip hours-chip ${hoursStatus.tone}`}>
					<span class="chip-icon chip-icon-status" aria-hidden="true">◷</span>
					<span class="status-dot" aria-hidden="true"></span>
					<span>{hoursStatus.label}</span>
					{#if hoursStatus.detail}
						<span class="chip-meta">{hoursStatus.detail}</span>
					{/if}
				</div>
			</div>
		</div>
		<div class="top-right">
			<div class="top-item">
				<a href="/product/pricelist" class="utility-chip">
					<span class="chip-icon" aria-hidden="true">≡</span>
					<span>Pricelist</span>
				</a>
			</div>
			<div class="top-item">
				<button type="button" class="super-nav-button utility-chip" on:click={handleCompareNavClick}>
					<span class="chip-icon" aria-hidden="true">⇄</span>
					<span>Compare</span>
				</button>
			</div>
			<div class="top-item">
				<a href="/product/cart" class="utility-chip">
					<img src="/cart.svg" alt="cart icon" class="svg-filter-white cart" />
					<span>Cart</span>
				</a>
			</div>
		</div>
	</div>
	<div class="hr"></div>
	<div class="bottom inner" bind:this={bottomRowEl}>
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
		<ul class="navbar-list desktop-nav" on:mouseleave={clearDesktopHover} on:focusout={clearDesktopHover}>
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class:active={isActive(item.href)}
						style={getDesktopLinkStyle(item.href, $desktopHoverProgress)}
						on:mouseenter={() => setDesktopHover(item.href, true)}
						on:mouseleave={() => setDesktopHover(item.href, false)}
						on:focus={() => handleDesktopFocus(item.href)}
						on:blur={() => setDesktopHover(item.href, false)}
					>
						<span>{item.label}</span>
					</a>
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
			transition:fade={{ duration: 80 }}
		></button>
		<div
			class="mobile-panel"
			role="dialog"
			aria-label="Site navigation"
			transition:fly={{ x: -280, duration: 280 }}
		>
			<ul class="mobile-nav-list">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class:active={isMobileActive(item.href)}
							style={getMobileLinkStyle(item.href, $mobileWidths)}
							on:click={(event) => handleMobileNavClick(event, item.href)}
						>
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>

<style lang="scss">
	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--grey);
		color: white;
		min-height: 28px;
		padding: 0.18rem 0;
		overflow-x: auto;
		scrollbar-width: thin;
	}
	.top-left,
	.top-right {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.top-right {
		justify-content: flex-end;
	}

	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
	}

	.top-item {
		padding: 0;
		margin-left: 0;
		font-size: 0.78rem;
		color: white;
	}

	.top-item a,
	.top-item .super-nav-button,
	.utility-chip {
		color: white;
	}
	.top-item .super-nav-button {
		padding: 0.18rem 0.44rem;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		text-decoration: none;
	}
	.utility-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.28rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.24);
		border-radius: 999px;
		padding: 0.18rem 0.44rem;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		text-decoration: none;
		white-space: nowrap;
	}
	.chip-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.05rem;
		height: 1.05rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.18);
		font-size: 0.72rem;
		font-weight: 700;
	}
	.chip-icon-status {
		font-size: 0.7rem;
	}
	.hours-chip {
		font-weight: 700;
	}
	.hours-chip.open {
		background: rgba(52, 168, 83, 0.22);
		border-color: rgba(52, 168, 83, 0.7);
	}
	.hours-chip.soon {
		background: rgba(251, 188, 5, 0.24);
		border-color: rgba(251, 188, 5, 0.75);
	}
	.hours-chip.closed {
		background: rgba(234, 67, 53, 0.2);
		border-color: rgba(234, 67, 53, 0.65);
	}
	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.9;
	}
	.hours-chip.open .status-dot {
		color: #7dff9a;
	}
	.hours-chip.soon .status-dot {
		color: #ffe38b;
	}
	.hours-chip.closed .status-dot {
		color: #ff9d93;
	}
	.chip-meta {
		opacity: 0.86;
		font-weight: 500;
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
		min-height: 120px;
		padding-bottom: 20px;
		box-sizing: border-box;
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
		width: auto;
		justify-content: flex-start;
		margin: 0;
		padding: 0;
		gap: 17px;
	}

	.navbar-list li,
	.mobile-nav-list li {
		list-style-type: none;
		position: relative;
	}

	.navbar-list a,
	.mobile-nav-list a {
		--nav-shadow: var(--yellow-accent);
		color: var(--white);
		text-decoration: none;
		display: flex;
		height: var(--nav-height);
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 3px 10px;
		font-size: 1.44rem;
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		background: var(--grey);
		border: 1px solid var(--white);
		box-shadow: 6px 6px 0 var(--nav-shadow);
		transform: skew(-14deg) translate(var(--nav-float-x, 0px), var(--nav-float-y, 0px));
		transition:
			width 0.24s ease,
			height 0.24s ease,
			padding 0.24s ease,
			font-size 0.24s ease;
	}

	.navbar-list a span,
	.mobile-nav-list a span {
		display: block;
		width: 100%;
		padding: 0 0.45rem;
		box-sizing: border-box;
		text-align: right;
		transform: skew(14deg);
	}

	.navbar-list a.active,
	.mobile-nav-list a.active {
		--nav-shadow: var(--yellow-accent);
	}

	.mobile-backdrop {
		position: fixed;
		left: 0;
		right: 0;
		top: var(--header);
		bottom: 0;
		background: rgba(0, 0, 0, 0.35);
		border: 0;
		padding: 0;
		margin: 0;
		z-index: 98;
	}

	.mobile-panel {
		position: fixed;
		top: var(--header);
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--grey);
		z-index: 99;
		padding: 0.6rem 1.15rem 1rem;
		box-sizing: border-box;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.mobile-nav-list {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 17px;
	}

	.mobile-nav-list li {
		border-bottom: 0;
	}

	.mobile-nav-list a {
		height: 44px;
		width: var(--mobile-pill-width);
		font-size: 1.64rem;
		padding: 0 0.75rem;
		margin: 0;
		background: var(--white);
		color: var(--grey);
		border-color: var(--grey);
		box-shadow: 6px 6px 0 var(--nav-shadow);
		transition: none;
	}

	.mobile-nav-list a:hover,
	.mobile-nav-list a:focus-visible {
		transform: skew(-14deg);
		outline: none;
	}

	@media only screen and (min-width: 701px) {
		.menu-toggle {
			display: none;
		}

		.desktop-nav {
			display: flex;
		}

		.navbar-list {
			align-items: flex-start;
		}

		.navbar-list li {
			align-self: flex-start;
		}

		.navbar-list li::after {
			content: '';
			position: absolute;
			inset: 0;
			background: var(--yellow-accent);
			border: 0;
			box-shadow: 2px 2px 0 var(--yellow-accent);
			transform: skew(-14deg);
			pointer-events: none;
			z-index: 0;
		}

		.navbar-list a {
			display: inline-flex;
			height: 30px;
			padding: 0 0.62rem;
			font-size: 1.2rem;
			background: var(--white);
			color: var(--grey);
			border-color: var(--grey);
			box-shadow: none;
			position: relative;
			z-index: 1;
			transition:
				width 0.24s ease,
				height 0.24s ease,
				padding 0.24s ease,
				font-size 0.24s ease;
		}

		.navbar-list a:not(.active) {
			height: 24px;
			font-size: 1.08rem;
			padding: 1px 0.34rem;
			box-shadow: none;
		}

		.navbar-list a:hover,
		.navbar-list a:focus-visible {
			outline: none;
		}
	}

	.cart {
		height: 15px;
		margin-right: 0;
	}
	.top-item-hours {
		margin: 0;
	}

	@media only screen and (max-width: 700px) {
		.top {
			justify-content: space-between;
		}
		.chip-meta {
			display: none;
		}
		.top-right {
			gap: 0.25rem;
		}
	}
</style>
