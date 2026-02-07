<script>
	//cart incrementing and decrementing
	import { cart } from '$lib/stores.js';
	import { openGlobalProductModal, openGlobalWishlistModal } from '$lib/modal-store';
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

	const changeQuantity = function (obj, operator) {
		if (!$cart?.some((x) => x.id === obj.id) && operator !== 'sub') {
			$cart = [...$cart, obj];
		} else {
			$cart.map((x, index) => {
				if (x.id === obj.id) {
					if (operator === 'add') {
						$cart[index].quantity += 1;
					} else if (operator === 'sub' && x.quantity > 1) {
						$cart[index].quantity -= 1;
					} else if (operator === 'sub' && x.quantity === 1) {
						$cart.splice(index, 1);
					}
				}
			});
		}
		localStorage.setItem('cart', JSON.stringify($cart));
		if (typeof window !== 'undefined') {
			$cart = JSON.parse(localStorage.getItem('cart'));
		}
	};
	$: getQuantity = function (id) {
		let newArray = $cart?.filter((x) => x.id === id) ?? [];
		return newArray[0]?.quantity ?? '0';
	};
	$: itemObject = {
		id: product.id,
		quantity: 1,
		title: product.title,
		deal: product.deal === '2 FOR' ? 2 : 3,
		price: product.price.toFixed(2)
	};
</script>

<div class="clicker-container" class:inline>
	<div class="assembly-shell">
		<div
			class="details-pill"
			role="button"
			tabindex="0"
			aria-label={`View details for ${product.title}`}
			on:click={openDetails}
			on:keydown={handleDetailsKeydown}
		>
			Details
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
					<button type="button" class="wishlist-pill" on:click={openWishlist}>Wishlist</button>
				</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.clicker-container {
		position: static;
		width: fit-content;
		margin: 10px 16px 10px 17px;
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
		margin-right: -7px;
	}

	.right-side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
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
	.clicker-sub {
		border-radius: 0px 0px 0px 0px;
	}
	.clicker-add {
		border-radius: 0px 5px 0px 0px;
	}
	.wishlist-pill {
		display: block;
		width: 116px;
		height: 30px;
		text-align: center;
		padding: 0.3em 0.6em;
		border: 1px solid var(--grey);
		border-radius: 0px 0px 6px 0px;
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
		height: 66px;
		display: block;
		width: 138px;
		text-align: center;
		border: 1px solid var(--grey);
		border-radius: 6px 0px 0px 6px;
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
	.red {
		background: var(--red);
	}
	.yellow {
		background: var(--yellow-accent);
		color: var(--grey);
	}
</style>
