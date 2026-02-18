<script>
	//cart incrementing and decrementing
	import { cart } from '$lib/stores.js';
	import { compare } from '$lib/stores.js';
	import {
		openGlobalCompareModal,
		openGlobalProductModal,
		openGlobalWishlistModal
	} from '$lib/modal-store';
	import { normalizeCompareItem, sanitizeCompareList } from '$lib/compare/compareItem';
	import { onMount } from 'svelte';
	export let product;
	export let inline = false;
	export let onDetails = null;
	export let onWishlist = null;
	export let showWishlist = true;

	const openDetails = () => {
		if (onDetails) {
			onDetails(product);
			return;
		}
		openGlobalProductModal(product?.id);
	};

	const handleDetailsKeydown = (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openDetails();
		}
	};

	const openWishlist = () => {
		if (onWishlist) {
			onWishlist();
			return;
		}
		openGlobalWishlistModal();
	};

	const openCompare = () => {
		openGlobalCompareModal();
	};

	const readStoredList = (key) => {
		if (typeof window === 'undefined') return [];
		try {
			const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
			if (!Array.isArray(parsed)) return [];
			return key === 'compare' ? sanitizeCompareList(parsed) : parsed;
		} catch {
			return [];
		}
	};

	const writeStoredList = (key, list) => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(key, JSON.stringify(list));
	};

	onMount(() => {
		$cart = readStoredList('cart');
		$compare = readStoredList('compare');
		writeStoredList('compare', $compare);
	});

	const changeQuantity = function (obj, operator) {
		const safeCart = Array.isArray($cart) ? $cart : [];
		if (!safeCart.some((x) => x.id === obj.id) && operator !== 'sub') {
			$cart = [...safeCart, obj];
		} else {
			safeCart.map((x, index) => {
				if (x.id === obj.id) {
					if (operator === 'add') {
						safeCart[index].quantity += 1;
					} else if (operator === 'sub' && x.quantity > 1) {
						safeCart[index].quantity -= 1;
					} else if (operator === 'sub' && x.quantity === 1) {
						safeCart.splice(index, 1);
					}
				}
			});
			$cart = [...safeCart];
		}
		writeStoredList('cart', $cart);
	};

	const toggleCompare = function (obj) {
		const safeCompare = Array.isArray($compare) ? $compare : [];
		const normalized = normalizeCompareItem(obj);
		if (!normalized) return;
		const isSelected = safeCompare.some((item) => item.id === normalized.id);
		$compare = isSelected
			? safeCompare.filter((item) => item.id !== normalized.id)
			: [...safeCompare, normalized];
		writeStoredList('compare', $compare);
	};

	$: isCompared = (id) => {
		const safeCompare = Array.isArray($compare) ? $compare : [];
		return safeCompare.some((item) => item.id === id);
	};
	$: getQuantity = function (id) {
		let newArray = $cart?.filter((x) => x.id === id) ?? [];
		return newArray[0]?.quantity ?? '0';
	};
	$: itemObject = {
		id: product.id,
		quantity: 1,
		title: product.title,
		deal: product.deal,
		price: product.price.toFixed(2)
	};

	$: compareObject = {
		id: product.id,
		title: product.title,
		price: product.price,
		imageThumb: product.imageThumb,
		category: product.category,
		deal: product.deal,
		colors: product.colors,
		effects: product.effects,
		shotCount: product.shotCount,
		duration: product.duration,
		height: product.height
	};
</script>

<div class="clicker-container" class:inline>
	<div class="assembly-shell">
		<div>
			<div
				class="details-pill"
				role="button"
				tabindex="0"
				aria-label={`View details for ${product.title}`}
				on:click={openDetails}
				on:keydown={handleDetailsKeydown}
			>
				<span class="sr-only">Details</span>
				<span class="details-icon-set" aria-hidden="true">
					<svg viewBox="0 0 24 24" role="img" focusable="false">
						<path
							fill="currentColor"
							d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h14V7H5zm2 8 3.8-4.5 2.9 3.3 2.1-2.5 2.2 3.7H7z"
						/>
					</svg>
					<span class="pipe">|</span>
					<svg viewBox="0 0 24 24" role="img" focusable="false">
						<path
							fill="currentColor"
							d="M6 5h9a2 2 0 0 1 2 2v2.5l4-2.5v10l-4-2.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v10h9V7H6z"
						/>
					</svg>
					<span class="pipe">|</span>
					<svg viewBox="0 0 24 24" role="img" focusable="false">
						<path
							fill="currentColor"
							d="M3 7h11v2H3V7zm0 8h7v2H3v-2zm11.5-6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm4 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
						/>
					</svg>
					<span class="pipe">|</span>
					<svg viewBox="0 0 24 24" role="img" focusable="false">
						<path
							fill="currentColor"
							d="M4 5h16v2H4V5zm0 4h16v2H4V9zm0 4h10v2H4v-2zm0 4h8v2H4v-2z"
						/>
					</svg>
				</span>
			</div>
			<div class="compare-row">
				<button class="compare-pill compare-link-pill" type="button" on:click={openCompare}>
					Compare
				</button>
				<button
					type="button"
					class="compare-pill {isCompared(product.id) ? 'active' : ''}"
					aria-pressed={isCompared(product.id)}
					on:click={() => toggleCompare(compareObject)}
				>
					{isCompared(product.id) ? '-' : '+'}
				</button>
			</div>
		</div>
		<div class="assembly-divider" aria-hidden="true"></div>
		<div class="right-side">
			<div class="clicker-content">
				<button class="clicker clicker-sub" on:click={() => changeQuantity(itemObject, 'sub')}>
					-
				</button>

				<button
					class="
					clicker
					{getQuantity(product.id) > 0 ? 'red' : ''} 
					{getQuantity(product.id) > 5 ? 'yellow' : ''}
				"
				>
					{getQuantity(product.id)}
				</button>
				<button class="clicker clicker-add" on:click={() => changeQuantity(itemObject, 'add')}>
					+
				</button>
			</div>
			{#if showWishlist}
				<span class="clicker-message">
					<button type="button" class="wishlist-pill" on:click={openWishlist}>Cart</button>
				</span>
			{/if}
		</div>
	</div>
	{#if showWishlist}{/if}
</div>

<style>
	.clicker-container {
		position: static;
		width: fit-content;
		margin: 10px 16px 10px 17px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.clicker-container.inline {
		position: static;
	}

	.assembly-shell {
		display: flex;
		align-items: flex-start;
		gap: 0.3em;
	}

	.clicker-content {
		display: flex;
		gap: 0.2em;
	}

	.assembly-divider {
		width: 3px;
		height: 67px;
		background: #000;
		transform: skew(-14deg);
		position: relative;
		left: -8px;
	}

	.clicker-message {
		width: 114px;
		display: flex;
		justify-content: center;
		margin-right: 9px;
		margin-top: 2px;
	}
	.clicker {
		display: inline-block;
		background: var(--grey);
		padding: 0.25em;
		color: white;
		width: 36px;
		height: 36px;
		text-align: center;
		transform: skew(-14deg);
		font-weight: 900;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background-color 0.25s ease-out;
		cursor: pointer;
		border: none;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.clicker:hover {
		transform: skew(-14deg) scale(1.03);
		filter: brightness(1.08);
		box-shadow: 5px 5px 0 var(--yellow-accent);
	}
	.clicker:active {
		transform: scale(110%) skew(-14deg);
	}
	.right-side {
		position: relative;
		left: -14px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.compare-row {
		display: flex;
		justify-content: flex-end;
		padding-right: 9px;
		position: relative;
		left: -9px;
	}
	.compare-pill {
		position: relative;
		left: 5px;
		top: 2px;
		display: block;
		width: 33px;
		height: 30px;
		text-align: center;
		padding: 0.3em 0.6em;
		border: 1px solid var(--grey);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 700;
		background: var(--white);
		color: var(--grey);
		box-shadow: none;
		text-decoration: none;
		transform: skew(-14deg);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.compare-link-pill {
		width: 103px;
		position: relative;
		left: 1px;
	}
	.compare-pill.active {
		background: var(--yellow-accent);
	}

	.wishlist-pill {
		display: block;
		width: 116px;
		height: 30px;
		text-align: center;
		padding: 0.3em 0.6em;
		border: 1px solid var(--grey);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 700;
		background: var(--grey);
		color: var(--white);
		box-shadow: none;
		text-decoration: none;
		transform: skew(-14deg);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.details-pill {
		height: 34px;
		display: block;
		width: 148px;
		text-align: center;
		border: 1px solid var(--grey);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 700;
		background: var(--grey);
		color: var(--white);
		text-decoration: none;
		transform: skew(-14deg);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		margin-right: -2px;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}
	.details-icon-set {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
	}
	.details-icon-set svg {
		width: 13px;
		height: 13px;
		display: block;
	}
	.details-icon-set .pipe {
		font-size: 0.8em;
		line-height: 1;
		opacity: 0.75;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.details-pill:hover {
		background: var(--grey);
		color: var(--white);
		transform: skew(-14deg) scale(1.03);
		filter: brightness(1.08);
		box-shadow: 5px 5px 0 var(--yellow-accent);
	}
	.wishlist-pill:hover {
		background: var(--grey);
		color: var(--white);
		transform: skew(-14deg) scale(1.03);
		filter: brightness(1.08);
		box-shadow: 5px 5px 0 var(--yellow-accent);
	}
	.compare-pill:hover {
		transform: skew(-14deg) scale(1.03);
		filter: brightness(1.08);
		box-shadow: 5px 5px 0 var(--yellow-accent);
	}
	.red {
		background: var(--red);
	}
	.yellow {
		background: var(--yellow-accent);
		color: var(--grey);
	}
</style>
