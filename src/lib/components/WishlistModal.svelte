<script>
	import Button from '$lib/components/elements/Button.svelte';
	import Container from '$lib/components/elements/Container.svelte';
	import { cart } from '$lib/stores.js';
	import { slugify } from '$lib/utility/slugify';

	export let onClose = () => {};

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

<div class="modal-page">
	<div class="modal-frame">
		<div class="modal-backdrop" on:click={onClose}></div>
		<div class="modal" role="dialog" aria-modal="true" aria-label="Wishlist">
			<div class="modal-header">
				<h2>Wishlist</h2>
				<button class="modal-close" type="button" on:click={onClose}>×</button>
			</div>
			<div class="modal-body">
				<Container>
					{#if $cart?.length >= 1}
						<div class="wishlist-cards">
							{#each $cart as item}
								{#if item.quantity > 0}
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
												<span class="value">{item.quantity}</span>
												<span class="subtle">@ ${(item.price / item.deal).toFixed(2)}/pc</span>
											</div>
											<div class="price-group">
												<span class="label">Regular/VIP</span>
												<span class="value"
													>$ {((item.price / item.deal) * item.quantity).toFixed(2)}</span
												>
											</div>
											<div class="price-group">
												<span class="label">Hi-Roller</span>
												<span class="value">$ {((item.price / 3) * item.quantity).toFixed(2)}</span>
											</div>
										</div>
									</article>
								{/if}
							{/each}
							<div class="totals-card">
								<div class="totals-row">
									<span>Totals (before tax)</span>
									<span class="total">$ {totals.vip.toFixed(2)} <em>VIP</em></span>
									<span class="total">$ {totals.hiro.toFixed(2)} <em>Hi-Roller</em></span>
								</div>
							</div>
							<p class="tax-note">
								all aerial and explosive items carry a 12% tax in addition to the regular state
								sales tax
							</p>
							<div class="actions">
								<Button on:click={() => window.print()}>Print</Button>
							</div>
						</div>
					{:else}
						<h2>No Items in wishlist</h2>
						<p>You may add items to your wishlist from the <a href="/product">Product Page</a></p>
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
	}
</style>
