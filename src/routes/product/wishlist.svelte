<script>
	import Button from '$lib/components/elements/Button.svelte';

	import Container from '$lib/components/elements/Container.svelte';
	import { cart } from '$lib/stores.js';
	if (typeof window !== 'undefined') {
		$cart = JSON.parse(localStorage.getItem('cart'));
	}
	export const sumTotalItemsPrice = function (array) {
		let hiroArray = [];
		let vipArray = [];
		array?.map((item) => {
			hiroArray.push((parseFloat(item.price) / 3) * parseFloat(item.quantity));
			vipArray.push((parseFloat(item.price) / item.deal) * parseFloat(item.quantity));
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
	$: totals = sumTotalItemsPrice($cart);
</script>

<Container>
	{#if $cart?.length >= 1}
		<div class="table-container">
			<table class="tg">
				<thead>
					<tr>
						<th class="tg-0pky">ID</th>
						<th class="tg-0pky">Title</th>
						<th class="tg-0pky">Quantity</th>
						<th class="tg-0pky">Regular/VIP Price</th>
						<th class="tg-0pky">Hi-Roller Price</th>
						<th class="tg-0pky print-hide">add/remove</th>
					</tr>
				</thead>

				<tbody>
					{#each $cart as item}
						{#if item.quantity > 0}
							<tr>
								<td class="tg-0pky">{item.id}</td>
								<td class="tg-0pky title">{item.title}</td>
								<td class="tg-0pky">{item.quantity} @ ${(item.price / item.deal).toFixed(2)}/pc</td>
								<td class="tg-0pky">$ {((item.price / item.deal) * item.quantity).toFixed(2)}</td>
								<td class="tg-0pky">$ {((item.price / 3) * item.quantity).toFixed(2)}</td>
								<td class="tg-0pky print-hide">
									<div class="clicker-content">
										<button
											on:click={() => {
												changeQuantity(item.id, 'sub');
											}}
										>
											-
										</button>
										<button
											on:click={() => {
												changeQuantity(item.id, 'add');
											}}
										>
											+
										</button>
										<button
											on:click={() => {
												changeQuantity(item.id, 'del');
											}}
										>
											<img src="/trashcan.svg" alt="trash can icon" />
										</button>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
					<tr>
						<td class="tg-0pky" colspan="3">Totals (before tax): </td>
						<td class="tg-0pky">$ {totals.vip.toFixed(2)} </td>
						<td class="tg-0pky">$ {totals.hiro.toFixed(2)}</td>
					</tr>
				</tbody>
			</table>
			<p>
				all aerial and explosive items carry a 12% tax in addition to the regular state sales tax
			</p>
			<span>
				<Button on:click={() => window.print()}>Print</Button>
			</span>
		</div>
	{:else}
		<h2>No Items in wishlist</h2>
		<p>You may add items to your wishlist from the <a href="/product">Product Page</a></p>
	{/if}
</Container>

<style lang="scss">
	.table-container {
		display: flex;
		justify-content: center;
		flex-direction: column;
		font-size: 0.9em;
	}
	.clicker-content {
		display: flex;
		align-items: center;
		justify-content: center;

		button {
			color: var(--white);
			width: 35px;
			height: 35px;
			border: none;
			background: var(--grey);
			font-size: 1.25em;
			font-weight: 600;
			margin: 0.05em;
			transform: skew(-14deg);
			cursor: pointer;
		}
		button:first-child {
			border-radius: 5px 0px 0px 5px;
		}
		button:last-child {
			border-radius: 0px 5px 5px 0px;
		}
		button:active {
			transform: scale(110%) skew(-14deg);
		}
		img {
			filter: invert(97%) sepia(0%) saturate(7500%) hue-rotate(162deg) brightness(104%)
				contrast(99%);
			margin: 0.5em 0em;
			width: 1em;
			height: 1em;
		}
	}
	td,
	th {
		padding: 0.5em 1em;
		text-align: left;
		font-family: sans-serif;
		-webkit-print-color-adjust: exact;
	}
	th {
		color: var(--white);
		background: var(--grey);
	}
	tr:nth-child(odd) {
		background: var(--grey-light);
	}
	.title {
		width: 15em;
	}

	@media print {
		table {
			height: 100%;
		}
		:global(header),
		:global(footer),
		:global(button),
		.print-hide {
			display: none !important;
		}
	}
</style>
