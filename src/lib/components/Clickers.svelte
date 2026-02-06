<script>
	//cart incrementing and decrementing
	import { cart } from '$lib/stores.js';
	export let product;
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

<div class="clicker-container">
	<a
		href="/product/{product.id}/{product.title ? product.title.toLowerCase().replace(/\\s+/g, '-') : ''}"
		class="details-pill"
	>
		Details
	</a>
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
	<span class="clicker-message">
		<a href="/product/wishlist" class="wishlist-pill">Wishlist</a>
	</span>
</div>

<style>
	.clicker-container {
		position: absolute;
		bottom: 10px;
		right: 1px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.clicker-content {
		display: flex;
		gap: 0.2em;
	}
	.clicker-message {
		width: calc(3 * 2.25em + 2 * 0.2em);
		display: flex;
		justify-content: center;
		margin-right: 0;
		margin-top: 0.1em;
	}
	.clicker {
		display: inline-block;
		background: var(--grey);
		padding: 0.25em;
		color: white;
		width: 2.25em;
		text-align: center;
		transform: skew(-14deg);
		font-weight: 900;
		transition: background-color 0.25s ease-out;
		cursor: pointer;
		border: none;
	}
	.clicker:active {
		transform: scale(110%) skew(-14deg);
	}
	.clicker-sub {
		margin-left: 1em;
		border-radius: 0px 0px 0px 0px;
	}
	.clicker-add {
		margin-right: 1em;
		border-radius: 0px 5px 0px 0px;
	}
	.wishlist-pill {
		display: block;
		width: 100%;
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
		transform: skew(-14deg) translateX(-23px);
	}
	.details-pill {
		position: absolute;
		right: calc(100% + 2px);
		top: 0;
		bottom: 0;
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
		transform: skew(-14deg) translateX(6px);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.details-pill:hover {
		background: var(--grey);
		color: var(--white);
	}
	.wishlist-pill:hover {
		background: var(--grey);
		color: var(--white);
	}
	.red {
		background: var(--red);
	}
	.yellow {
		background: var(--yellow-accent);
		color: var(--grey);
	}
</style>
