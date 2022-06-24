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
		<strong> add/remove from wishlist </strong>
		<br />
		<a href="/product/wishlist">See Wishlist</a>
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
		margin-right: 0.1em;
		border-radius: 5px 0px 0px 5px;
	}
	.clicker-add {
		margin-right: 1em;
		margin-left: 0.15em;
		border-radius: 0px 5px 5px 0px;
	}
	.clicker-message {
		padding-right: 1em;
		font-size: 0.75em;
		margin-top: 0.1em;
	}
	.red {
		background: var(--red);
	}
	.yellow {
		background: var(--yellow-accent);
		color: var(--grey);
	}
</style>
