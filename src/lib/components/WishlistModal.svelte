<script>
	import { onMount } from 'svelte';
	import { fallbackAllData } from '$lib/cms/fallback';
	import { STORE_TIMEZONE, getNowInTimezone } from '$lib/cms/hours';
	import {
		PICKUP_SLOT_STEP_MINUTES,
		getPickupAvailability,
		getPickupTimeSlots,
		normalizeMaxDaysOut
	} from '$lib/cms/pickup';
	import { formatDealLabel, getDealDivisor } from '$lib/cart/deal';
	import Container from '$lib/components/elements/Container.svelte';
	import { cart } from '$lib/stores.js';
	import { formatTimeLabel } from '$lib/utility/time';
	import { slugify } from '$lib/utility/slugify';

	export let onClose = () => {};
	export let showCheckout = true;
	export let mode = null;
	export let checkoutHref = '/product/cart/checkout';
	export let backHref = '/product/cart';
	export let onCheckout = null;
	export let onBackToCart = null;
	export let allData = fallbackAllData;

	if (typeof window !== 'undefined') {
		$cart = JSON.parse(localStorage.getItem('cart'));
	}

	const pickupWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: STORE_TIMEZONE,
		weekday: 'short'
	});
	const pickupDateFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: STORE_TIMEZONE,
		month: 'short',
		day: 'numeric'
	});
	const pickupLongFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: STORE_TIMEZONE,
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	const toNumberOr = (value, fallback = 0) => {
		const num = Number(value);
		return Number.isFinite(num) ? num : fallback;
	};

	const getQuantity = (item) => Math.max(0, toNumberOr(item?.quantity, 0));
	const getBundlePrice = (item) => Math.max(0, toNumberOr(item?.price, 0));
	const getVipUnitPrice = (item) => getBundlePrice(item) / getDealDivisor(item?.deal);
	const getVipSubtotal = (item) => getVipUnitPrice(item) * getQuantity(item);
	const getHiRollerSubtotal = (item) => (getBundlePrice(item) / 3) * getQuantity(item);
	const formatPickupDate = (dateValue) => {
		const date = new Date(`${dateValue}T12:00:00Z`);
		return Number.isNaN(date.getTime()) ? dateValue : pickupDateFormatter.format(date);
	};
	const formatPickupWeekday = (dateValue) => {
		const date = new Date(`${dateValue}T12:00:00Z`);
		return Number.isNaN(date.getTime()) ? '' : pickupWeekdayFormatter.format(date);
	};
	const formatPickupDateLong = (dateValue) => {
		const date = new Date(`${dateValue}T12:00:00Z`);
		return Number.isNaN(date.getTime()) ? dateValue : pickupLongFormatter.format(date);
	};
	const formatPickupWindow = (hours) =>
		hours?.open && hours?.close ? `${formatTimeLabel(hours.open)} - ${formatTimeLabel(hours.close)}` : '';
	const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
	const isValidPhone = (value) => String(value || '').replace(/\D/g, '').length >= 10;
	const getPickupDateStatusLabel = (entry) => {
		switch (entry?.status) {
			case 'open':
				return `${entry.slotCount} slot${entry.slotCount === 1 ? '' : 's'}`;
			case 'closed':
				return 'Closed';
			case 'no_slots_left':
				return 'Today full';
			default:
				return 'Unavailable';
		}
	};
	const getPickupSelectionMessage = ({
		firstSelectablePickup,
		selectedDateAvailability,
		selectedDateSlotInfo,
		pickupDate,
		pickupTime,
		hasSelectablePickupTime
	}) => {
		if (!selectedDateAvailability) {
			if (firstSelectablePickup) {
				return `Select a pickup date. First available: ${formatPickupDateLong(firstSelectablePickup.dateValue)}.`;
			}
			return 'No pickup dates are currently available. Please call the store to place an order.';
		}
		if (selectedDateAvailability.status === 'closed') {
			return `${formatPickupDateLong(pickupDate)} is closed for pickup.`;
		}
		if (selectedDateAvailability.status === 'unavailable') {
			return `Store hours are unavailable for ${formatPickupDateLong(pickupDate)}.`;
		}
		if (selectedDateAvailability.status === 'no_slots_left') {
			return `No pickup times remain on ${formatPickupDateLong(pickupDate)}. Choose another available date.`;
		}
		if (!pickupTime) {
			return `Choose a 15-minute pickup time on ${formatPickupDateLong(pickupDate)} between ${formatPickupWindow(selectedDateSlotInfo?.hours)}.`;
		}
		if (!hasSelectablePickupTime) {
			return `The selected pickup time is no longer available on ${formatPickupDateLong(pickupDate)}. Choose another 15-minute slot.`;
		}
		return `Pickup selected for ${formatPickupDateLong(pickupDate)} at ${formatTimeLabel(pickupTime)}.`;
	};

	export const sumTotalItemsPrice = function (array) {
		let hiroArray = [];
		let vipArray = [];
		array?.map((item) => {
			hiroArray.push(getHiRollerSubtotal(item));
			vipArray.push(getVipSubtotal(item));
		});
		let hiroTotal = hiroArray.reduce(function (a, b) {
			return a + b;
		}, 0);
		let vipTotal = vipArray.reduce(function (a, b) {
			return a + b;
		}, 0);
		return { hiro: hiroTotal, vip: vipTotal };
	};

	const changeQuantity = function (id, operator) {
		$cart.map((x, index) => {
			if (x.id === id) {
				if (operator === 'add') {
					$cart[index].quantity += 1;
				} else if (operator === 'sub' && x.quantity === 1) {
					$cart[index].quantity = 1;
				} else if (operator === 'sub' && x.quantity > 1) {
					$cart[index].quantity -= 1;
				} else if (operator === 'del') {
					$cart.splice(index, 1);
				}
			}
		});
		localStorage.setItem('cart', JSON.stringify($cart));
		if (typeof window !== 'undefined') {
			$cart = JSON.parse(localStorage.getItem('cart'));
		}
	};

	const resetCheckoutFeedback = () => {
		checkoutError = '';
	};

	const selectPickupDate = (dateValue) => {
		if (pickupDate !== dateValue) {
			pickupDate = dateValue;
			pickupTime = '';
		}
		resetCheckoutFeedback();
	};

	const selectPickupTime = (timeValue) => {
		pickupTime = timeValue;
		resetCheckoutFeedback();
	};

	let checkoutEmail = '';
	let checkoutPhone = '';
	let pickupDate = '';
	let pickupTime = '';
	let agreeToPickup = false;
	let submittingCheckout = false;
	let checkoutError = '';
	let downloadingInvoice = false;
	let checkoutConfirmation = null;
	let storeNow = getNowInTimezone(STORE_TIMEZONE);

	const refreshStoreNow = () => {
		storeNow = getNowInTimezone(STORE_TIMEZONE);
	};

	$: totals = sumTotalItemsPrice($cart);
	$: visibleCart = Array.isArray($cart) ? $cart.filter((item) => getQuantity(item) > 0) : [];
	$: viewMode = mode || (showCheckout ? 'checkout' : 'list');
	$: isCheckoutView = viewMode === 'checkout';
	$: cmsData = allData ?? fallbackAllData;
	$: pickupMaxDaysOut = normalizeMaxDaysOut(cmsData?.pickupSettings?.maxDaysOut);
	$: pickupAvailability = getPickupAvailability(cmsData, {
		now: storeNow,
		maxDaysOut: pickupMaxDaysOut,
		stepMinutes: PICKUP_SLOT_STEP_MINUTES
	});
	$: firstSelectablePickup = pickupAvailability.find((entry) => entry.selectable) ?? null;
	$: selectedDateAvailability = pickupAvailability.find((entry) => entry.dateValue === pickupDate) ?? null;
	$: selectedDateSlotInfo = pickupDate
		? getPickupTimeSlots(cmsData, pickupDate, {
				now: storeNow,
				stepMinutes: PICKUP_SLOT_STEP_MINUTES
			})
		: null;
	$: pickupTimeSlots = selectedDateSlotInfo?.slots ?? [];
	$: hasSelectablePickupTime = pickupTimeSlots.some(
		(slot) => slot.value === pickupTime && slot.selectable
	);
	$: checkoutSelectionMessage = getPickupSelectionMessage({
		firstSelectablePickup,
		selectedDateAvailability,
		selectedDateSlotInfo,
		pickupDate,
		pickupTime,
		hasSelectablePickupTime
	});
	$: checkoutReady = Boolean(
		visibleCart.length &&
			isValidEmail(checkoutEmail) &&
			isValidPhone(checkoutPhone) &&
			selectedDateAvailability?.selectable &&
			hasSelectablePickupTime &&
			agreeToPickup &&
			!submittingCheckout
	);

	$: if (pickupDate && !selectedDateAvailability && pickupTime) {
		pickupTime = '';
	}
	$: if (pickupDate && selectedDateAvailability && !selectedDateAvailability.selectable && pickupTime) {
		pickupTime = '';
	}

	onMount(() => {
		refreshStoreNow();
		const intervalId = window.setInterval(refreshStoreNow, 60_000);
		return () => window.clearInterval(intervalId);
	});

	const submitCheckout = async () => {
		checkoutError = '';
		if (!visibleCart.length) {
			checkoutError = 'Your cart is empty.';
			return;
		}
		if (!selectedDateAvailability?.selectable) {
			checkoutError = checkoutSelectionMessage;
			return;
		}
		if (!hasSelectablePickupTime) {
			checkoutError = 'Select one of the available pickup times before submitting.';
			return;
		}
		submittingCheckout = true;
		try {
			const response = await fetch('/data/cart/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: checkoutEmail,
					phone: checkoutPhone,
					pickupDate,
					pickupTime,
					agreeToPickup,
					items: visibleCart
				})
			});
			const payload = await response.json().catch(() => ({}));
			if (!response.ok) {
				checkoutError = payload?.error || 'Checkout failed.';
				return;
			}
			checkoutConfirmation = {
				orderId: payload?.orderId || 'N/A',
				pickupDate: payload?.pickupDate || pickupDate,
				pickupTime: payload?.pickupTime || pickupTime,
				email: checkoutEmail,
				phone: checkoutPhone,
				totals: payload?.totals || {
					vip: Number(totals.vip.toFixed(2)),
					hiro: Number(totals.hiro.toFixed(2))
				}
			};
			$cart = [];
			localStorage.setItem('cart', JSON.stringify([]));
		} catch (error) {
			checkoutError = error instanceof Error ? error.message : 'Checkout failed.';
		} finally {
			submittingCheckout = false;
		}
	};

	const downloadInvoice = async () => {
		downloadingInvoice = true;
		checkoutError = '';
		try {
			const response = await fetch('/data/cart/invoice', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: visibleCart })
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload?.error || 'Failed to generate invoice PDF.');
			}
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `notb-cart-${Date.now()}.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			checkoutError = error instanceof Error ? error.message : 'Failed to generate invoice PDF.';
		} finally {
			downloadingInvoice = false;
		}
	};

	const openCheckout = () => {
		checkoutConfirmation = null;
		if (onCheckout) {
			onCheckout();
			return;
		}
		if (typeof window !== 'undefined') {
			window.location.href = checkoutHref;
		}
	};

	const backToCart = () => {
		resetCheckoutFeedback();
		if (onBackToCart) {
			onBackToCart();
			return;
		}
		if (typeof window !== 'undefined') {
			window.location.href = backHref;
		}
	};
</script>

<div class="modal-page">
	<div class="modal-frame">
		<div class="modal-backdrop" on:click={onClose}></div>
			<div class="modal" role="dialog" aria-modal="true" aria-label={isCheckoutView ? 'Checkout' : 'Cart'}>
				<div class="modal-header">
					<h2>{isCheckoutView ? 'Checkout' : 'Cart'}</h2>
				<button class="modal-close" type="button" on:click={onClose}>×</button>
			</div>
			<div class="modal-body">
				<Container>
					{#if visibleCart.length >= 1 || checkoutConfirmation}
							<div class="wishlist-cards">
								{#if isCheckoutView}
									{#if !checkoutConfirmation}
										<div class="checkout-nav print-hide">
											<button class="back-link" type="button" on:click={backToCart}>
												Back to Cart
											</button>
										</div>
										<div class="totals-card">
											<div class="totals-row">
												<span>Checkout Summary</span>
												<span class="total">{visibleCart.length} items</span>
												<span class="total">$ {totals.vip.toFixed(2)} <em>VIP</em></span>
												<span class="total">$ {totals.hiro.toFixed(2)} <em>Hi-Roller</em></span>
											</div>
										</div>
										<p class="tax-note">
											All totals shown are pre-tax totals. All aerial and explosive items carry a 12% tax
											in addition to the regular state sales tax.
										</p>
										<form class="checkout-form" on:submit|preventDefault={submitCheckout}>
											<h3>Checkout Request</h3>
											<p class="checkout-note">
												No online payment is required. Payment happens in-store at pickup.
											</p>
											<label for="checkout-email">Email</label>
											<input
												id="checkout-email"
												type="email"
												bind:value={checkoutEmail}
												required
												autocomplete="email"
												on:input={resetCheckoutFeedback}
											/>

											<label for="checkout-phone">Phone Number</label>
											<input
												id="checkout-phone"
												type="tel"
												bind:value={checkoutPhone}
												required
												autocomplete="tel"
												on:input={resetCheckoutFeedback}
											/>

											<div class="pickup-picker">
												<div class="pickup-section">
													<div class="pickup-section-header">
														<span class="pickup-field-label">Pickup Date</span>
														<span class="pickup-section-meta">Next {pickupMaxDaysOut + 1} day window</span>
													</div>
													<div class="pickup-date-grid" role="list" aria-label="Pickup dates">
														{#each pickupAvailability as entry}
															<button
																type="button"
																class="pickup-date-button"
																class:selected={pickupDate === entry.dateValue}
																class:disabled={!entry.selectable}
																disabled={!entry.selectable}
																aria-pressed={pickupDate === entry.dateValue}
																on:click={() => selectPickupDate(entry.dateValue)}
															>
																<span class="pickup-date-day">{formatPickupWeekday(entry.dateValue)}</span>
																<span class="pickup-date-value">{formatPickupDate(entry.dateValue)}</span>
																<span class="pickup-date-status">{getPickupDateStatusLabel(entry)}</span>
															</button>
														{/each}
													</div>
												</div>

												<div class="pickup-section">
													<div class="pickup-section-header">
														<span class="pickup-field-label">Pickup Time</span>
														<span class="pickup-section-meta">
															{#if selectedDateSlotInfo?.hours?.open && selectedDateSlotInfo?.hours?.close}
																{formatPickupWindow(selectedDateSlotInfo.hours)}
															{:else}
																Select a valid pickup date first
															{/if}
														</span>
													</div>
													{#if selectedDateAvailability?.status === 'open'}
														<div class="pickup-time-grid" role="list" aria-label="Pickup times">
															{#each pickupTimeSlots as slot}
																<button
																	type="button"
																	class="pickup-time-button"
																	class:selected={pickupTime === slot.value}
																	class:disabled={!slot.selectable}
																	disabled={!slot.selectable}
																	aria-pressed={pickupTime === slot.value}
																	on:click={() => selectPickupTime(slot.value)}
																>
																	{slot.label}
																</button>
															{/each}
														</div>
													{:else}
														<div class="pickup-time-empty">
															No pickup times are available for the current selection.
														</div>
													{/if}
												</div>
											</div>

											<p
												class="pickup-selection-message"
												class:error={Boolean(checkoutError)}
												aria-live="polite"
											>
												{checkoutError || checkoutSelectionMessage}
											</p>

											<label class="agreement">
												<input type="checkbox" bind:checked={agreeToPickup} required />
												<span>
													I agree to pick up at the selected date/time and understand that any changes must be
													communicated by email or phone call.
												</span>
											</label>

											<div class="checkout-actions">
												<button class="checkout-submit" type="submit" disabled={!checkoutReady}>
													{submittingCheckout ? 'Submitting...' : 'Submit Checkout'}
												</button>
											</div>
										</form>
									{:else}
										<section class="checkout-confirmation" aria-live="polite">
											<h3>Order Request Submitted</h3>
											<p class="checkout-success">
												Reference #{checkoutConfirmation.orderId}
											</p>
											<div class="confirmation-grid">
												<div class="confirmation-card">
													<span class="confirmation-label">Pickup</span>
													<strong>
														{formatPickupDateLong(checkoutConfirmation.pickupDate)} at
														{formatTimeLabel(checkoutConfirmation.pickupTime)}
													</strong>
												</div>
												<div class="confirmation-card">
													<span class="confirmation-label">Contact</span>
													<strong>{checkoutConfirmation.email}</strong>
													<strong>{checkoutConfirmation.phone}</strong>
												</div>
												<div class="confirmation-card">
													<span class="confirmation-label">Estimated Total</span>
													<strong>$ {Number(checkoutConfirmation.totals?.vip || 0).toFixed(2)} VIP</strong>
													<strong>$ {Number(checkoutConfirmation.totals?.hiro || 0).toFixed(2)} Hi-Roller</strong>
												</div>
											</div>
											<p class="checkout-note">
												Management has your request. Payment happens in-store at pickup, and any changes should
												be handled by phone or email.
											</p>
											<div class="checkout-actions">
												<button class="checkout-submit" type="button" on:click={onClose}>
													Continue Shopping
												</button>
											</div>
										</section>
									{/if}
								{:else}
									{#each visibleCart as item}
										<article class="wishlist-card">
											<div class="card-header">
												<span class="id">#{item.id}</span>
												<a
													class="title"
													href="/product/{item.id}/{slugify(item.title)}"
													target="_blank">{item.title}</a
												>
												<div class="controls print-hide">
													<button
														class="clicker clicker-sub"
														on:click={() => changeQuantity(item.id, 'sub')}
													>
														-
													</button>
													<button
														class="clicker clicker-add"
														on:click={() => changeQuantity(item.id, 'add')}
													>
														+
													</button>
													<button
														class="clicker clicker-del"
														on:click={() => changeQuantity(item.id, 'del')}
													>
														<img src="/trashcan.svg" alt="trash can icon" />
													</button>
												</div>
											</div>
											<div class="card-body">
												<div class="price-group">
													<span class="label">Qty</span>
													<span class="value">{getQuantity(item)}</span>
													<span class="subtle">Deal: {formatDealLabel(item?.deal)}</span>
													<span class="subtle">@ ${getVipUnitPrice(item).toFixed(2)}/pc</span>
												</div>
												<div class="price-group">
													<span class="label">Regular/VIP</span>
													<span class="value">$ {getVipSubtotal(item).toFixed(2)}</span>
												</div>
												<div class="price-group">
													<span class="label">Hi-Roller</span>
													<span class="value">$ {getHiRollerSubtotal(item).toFixed(2)}</span>
												</div>
											</div>
										</article>
									{/each}
									<div class="totals-card">
										<div class="totals-row">
											<span>Totals (Pre-Tax)</span>
											<span class="total">$ {totals.vip.toFixed(2)} <em>VIP</em></span>
											<span class="total">$ {totals.hiro.toFixed(2)} <em>Hi-Roller</em></span>
										</div>
									</div>
									<p class="tax-note">
										All totals shown are pre-tax totals. All aerial and explosive items carry a 12% tax
										in addition to the regular state sales tax.
									</p>
									<div class="actions">
										<button class="download-button" type="button" on:click={downloadInvoice}>
											{downloadingInvoice ? 'Generating...' : 'Download Invoice'}
										</button>
										<button class="checkout-link" type="button" on:click={openCheckout}>Checkout</button>
									</div>
									{#if checkoutError}
										<p class="checkout-error">{checkoutError}</p>
									{/if}
								{/if}
							</div>
						{:else}
							{#if isCheckoutView}
								<div class="checkout-nav print-hide">
									<button class="back-link" type="button" on:click={backToCart}>
										Back to Cart
									</button>
								</div>
							{/if}
							<h2>{isCheckoutView ? 'No Items to Checkout' : 'No Items in Cart'}</h2>
							<p>You may add items to your cart from the <a href="/product">Product Page</a></p>
						{/if}
				</Container>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.modal-page {
		position: relative;
	}
	.modal-frame {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: calc(var(--nav-height) + 1.5em) 0 3.5em;
	}
	.modal-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		z-index: 1;
	}
	.modal {
		position: relative;
		transform: none;
		width: min(86vw, 1100px);
		max-height: calc(100vh - var(--nav-height) - 5em);
		overflow: auto;
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 10px 10px 0 var(--yellow-accent);
		z-index: 2;
		padding: 0;
	}
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1em;
		position: sticky;
		top: 0;
		background: var(--grey);
		color: var(--white);
		z-index: 5;
		padding: 0.75em 1.5em;
		border-top: 2px solid var(--white);
		border-left: 2px solid var(--white);
		border-right: 2px solid var(--white);
	}
	.modal-header h2 {
		margin: 0;
		text-transform: uppercase;
	}
	.modal-close {
		background: var(--white);
		color: var(--grey);
		border: none;
		width: 36px;
		height: 36px;
		font-size: 1.5em;
		cursor: pointer;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.modal-body {
		padding: 1.5em;
	}
	.wishlist-cards {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}
	.wishlist-card {
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		background: var(--white);
	}
	.card-header {
		background: #111;
		color: var(--white);
		padding: 0.4em 0.7em;
		display: flex;
		align-items: center;
		gap: 0.8em;
	}
	.card-header .id {
		font-weight: 700;
		color: var(--yellow-accent);
	}
	.card-header .title {
		color: var(--white);
		text-decoration: none;
		font-family: Langdon, Arial, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.card-body {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6em;
		padding: 0.6em 0.7em 0.7em;
		align-items: center;
	}
	.price-group {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}
	.price-group .label {
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.68em;
		color: var(--grey);
	}
	.price-group .value {
		font-size: 1em;
		font-weight: 700;
	}
	.price-group .subtle {
		font-size: 0.75em;
		color: var(--grey);
	}
	.controls {
		margin-left: auto;
		display: flex;
		gap: 0.22em;
	}
	.controls .clicker {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--grey);
		color: var(--white);
		width: 2.25em;
		height: 2.25em;
		text-align: center;
		transform: skew(-14deg);
		font-weight: 900;
		cursor: pointer;
		border: none;
		border-radius: 0;
		box-shadow: 2px 2px 0 var(--yellow-accent);
	}
	.controls .clicker:active {
		transform: scale(1.08) skew(-14deg);
	}
	.controls .clicker-sub {
		margin-left: 0.5em;
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		border-radius: 6px 0 0 6px;
	}
	.controls .clicker-add {
		background: var(--white);
		color: var(--grey);
		border: 1px solid var(--grey);
		border-radius: 0;
	}
	.controls .clicker-del {
		background: var(--white);
		border: 1px solid #000;
		border-radius: 0 6px 6px 0;
	}
	.controls .clicker-del img {
		width: 14px;
		height: 14px;
		filter: brightness(0) saturate(100%) invert(17%) sepia(100%) saturate(7142%) hue-rotate(357deg)
			brightness(95%) contrast(118%);
	}
	.controls .clicker img {
		transform: skew(14deg);
	}
	.totals-card {
		border: 2px solid var(--grey);
		background: var(--off-white);
		padding: 0.8em;
	}
	.totals-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		align-items: center;
		justify-content: space-between;
	}
	.total {
		font-weight: 800;
	}
	.total em {
		font-style: normal;
		font-size: 0.75em;
		text-transform: uppercase;
	}
	.tax-note {
		font-size: 0.85em;
		margin: 0.3em 0 0;
		color: var(--grey);
	}
	.actions {
		margin-top: 0.7em;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.checkout-nav {
		margin-bottom: 0.5rem;
	}
	.back-link {
		display: inline-block;
		color: var(--white);
		background: #7c1313;
		border: 1px solid #7c1313;
		padding: 0.5rem 1rem;
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.15rem;
		text-transform: uppercase;
		text-decoration: none;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.download-button,
	.checkout-link {
		color: var(--white);
		background: var(--grey);
		border: 1px solid var(--grey);
		padding: 0.5rem 1rem;
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.2rem;
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.download-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		box-shadow: none;
	}
	.checkout-form {
		margin-top: 1rem;
		border: 2px solid var(--grey);
		background: var(--off-white);
		padding: 0.9rem;
		display: grid;
		gap: 0.75rem;
	}
	.checkout-form h3 {
		margin: 0;
		text-transform: uppercase;
	}
	.checkout-note {
		margin: 0 0 0.25rem 0;
		font-size: 0.88rem;
	}
	.checkout-form label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 700;
	}
	.checkout-form input[type='email'],
	.checkout-form input[type='tel'] {
		border: 1px solid var(--grey);
		background: var(--white);
		padding: 0.45rem 0.5rem;
	}
	.pickup-picker {
		display: grid;
		gap: 0.9rem;
	}
	.pickup-section {
		display: grid;
		gap: 0.5rem;
	}
	.pickup-section-header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.pickup-field-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 700;
	}
	.pickup-section-meta {
		font-size: 0.8rem;
		color: var(--grey);
	}
	.pickup-date-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.6rem;
	}
	.pickup-date-button,
	.pickup-time-button {
		border: 1px solid var(--grey);
		background: var(--white);
		color: var(--grey);
		padding: 0.7rem 0.75rem;
		text-align: left;
		cursor: pointer;
		display: grid;
		gap: 0.15rem;
		min-height: 72px;
	}
	.pickup-date-button.selected,
	.pickup-time-button.selected {
		background: #111;
		color: var(--white);
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.pickup-date-button.disabled,
	.pickup-time-button.disabled,
	.pickup-date-button:disabled,
	.pickup-time-button:disabled {
		background: #ece7df;
		color: rgba(50, 50, 50, 0.5);
		border-color: rgba(0, 0, 0, 0.12);
		cursor: not-allowed;
		box-shadow: none;
	}
	.pickup-date-day,
	.pickup-date-status {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.pickup-date-value {
		font-size: 1rem;
		font-weight: 700;
	}
	.pickup-time-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
		gap: 0.6rem;
	}
	.pickup-time-button {
		min-height: auto;
		align-items: center;
		text-align: center;
		font-weight: 700;
	}
	.pickup-time-empty {
		border: 1px dashed rgba(0, 0, 0, 0.18);
		padding: 0.85rem;
		background: rgba(255, 255, 255, 0.75);
		color: var(--grey);
		font-size: 0.9rem;
	}
	.pickup-selection-message {
		margin: 0;
		padding: 0.75rem 0.9rem;
		border: 1px solid rgba(0, 0, 0, 0.12);
		background: rgba(255, 255, 255, 0.75);
		font-weight: 600;
	}
	.pickup-selection-message.error {
		border-color: rgba(156, 27, 27, 0.35);
		background: rgba(156, 27, 27, 0.08);
		color: #9c1b1b;
	}
	.agreement {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: start;
		text-transform: none !important;
		font-size: 0.85rem !important;
		font-weight: 500 !important;
		letter-spacing: 0 !important;
	}
	.checkout-actions {
		margin-top: 0.35rem;
	}
	.checkout-submit {
		color: var(--white);
		background: var(--grey);
		border: 1px solid var(--grey);
		padding: 0.5rem 1rem;
		font-family: Langdon, Arial, sans-serif;
		font-size: 1.2rem;
		text-transform: uppercase;
		cursor: pointer;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.checkout-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		box-shadow: none;
	}
	.checkout-error {
		margin: 0;
		color: #9c1b1b;
		font-weight: 700;
	}
	.checkout-success {
		margin: 0;
		color: #0e5a22;
		font-weight: 700;
	}
	.checkout-confirmation {
		margin-top: 1rem;
		border: 2px solid var(--grey);
		background: var(--off-white);
		padding: 1rem;
		display: grid;
		gap: 0.85rem;
	}
	.checkout-confirmation h3 {
		margin: 0;
		text-transform: uppercase;
	}
	.confirmation-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
	}
	.confirmation-card {
		background: var(--white);
		border: 1px solid var(--grey);
		padding: 0.8rem;
		display: grid;
		gap: 0.3rem;
	}
	.confirmation-label {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--grey);
	}
	@media print {
		.print-hide {
			display: none !important;
		}
		.modal-frame {
			position: static;
			padding: 0;
			inset: auto;
			display: block;
		}
		.modal-backdrop {
			display: none;
		}
		.modal {
			width: 100%;
			max-height: none;
			border: none;
			box-shadow: none;
			overflow: visible;
		}
	}
	@media (max-width: 1024px) {
		.card-body {
			grid-template-columns: 1fr;
			gap: 0.45em;
		}
		.modal {
			width: min(95vw, 1100px);
		}
		.modal-body {
			padding: 1em;
		}
		.pickup-date-grid,
		.pickup-time-grid,
		.confirmation-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
