<script>
	import Button from '$lib/components/elements/Button.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import { cart } from '$lib/stores.js';
	import { slugify } from '$lib/utility/slugify';
	import { goto } from '$app/navigation';

	export let data;

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

	const closeModal = () => {
		goto('/product');
	};
</script>

<div class="modal-page">
	<div class="modal-backdrop" on:click={closeModal}></div>
	<div class="modal" role="dialog" aria-modal="true" aria-label="Wishlist">
		<div class="modal-header">
			<h2>Wishlist</h2>
			<button class="modal-close" type="button" on:click={closeModal}>×</button>
		</div>
		<div class="modal-body">
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
											<td class="tg-0pky title">
												<a href="/product/{item.id}/{slugify(item.title)}" target="_blank"
													>{item.title}</a
												>
											</td>
											<td class="tg-0pky">{item.quantity} @ ${(item.price / item.deal).toFixed(2)}/pc</td>
											<td class="tg-0pky">$ {((item.price / item.deal) * item.quantity).toFixed(2)}</td>
											<td class="tg-0pky">$ {((item.price / 3) * item.quantity).toFixed(2)}</td>
											<td class="tg-0pky print-hide">
												<div class="clicker-content">
													<button on:click={() => changeQuantity(item.id, 'sub')}>-</button>
													<button on:click={() => changeQuantity(item.id, 'add')}>+</button>
													<button on:click={() => changeQuantity(item.id, 'del')}>
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
		</div>
	</div>
</div>

<style lang="scss">
	.modal-page {
		position: relative;
	}
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		z-index: 40;
	}
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(90vw, 1100px);
		max-height: 85vh;
		overflow: auto;
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 10px 10px 0 var(--yellow-accent);
		z-index: 50;
		padding: 1.5em;
	}
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1em;
	}
	.modal-header h2 {
		margin: 0;
		text-transform: uppercase;
	}
	.modal-close {
		background: var(--grey);
		color: var(--white);
		border: none;
		width: 36px;
		height: 36px;
		font-size: 1.5em;
		cursor: pointer;
	}
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
		.print-hide,
		:global(header),
		:global(footer),
		:global(button) {
			display: none !important;
		}
	}
</style>
