<script>
</script>

<nav>
	<ul class="nav-list">
		<li class="nav-link"><a href="/">Home</a></li>
		<li class="nav-link"><a href="/">Products</a></li>
		<li class="nav-drop">
			<span>Pricing</span>
			<ul id="pricing" class="dropdown-list">
				<li class="dropdown-item"><a href="/pricing">Pricing Overview</a></li>
				<li class="dropdown-item"><a href="/pricing#highroller">High Roller</a></li>
				<li class="dropdown-item"><a href="/pricing#vip">VIP</a></li>
				<li class="dropdown-item"><a href="/pricing#camp">Camp Programs</a></li>
				<li class="dropdown-item"><a href="/pricing#caselot">Case Lot Specials</a></li>
			</ul>
		</li>
		<li class="nav-drop">
			<span>FAQ</span>
			<ul id="faq" class="dropdown-list">
				<li class="dropdown-item"><a href="/faq">FAQ</a></li>
				<li class="dropdown-item"><a href="/faq/statelaw">State Law</a></li>
			</ul>
		</li>
		<li class="nav-link"><a href="/contact">Contact</a></li>
	</ul>
</nav>

<style lang="scss">
	nav {
		background-color: antiquewhite;
	}
	ul {
		list-style-type: none;
	}
	.nav-list {
		display: flex;
		flex-direction: row;
	}
	.nav-link,
	.nav-drop {
		display: flex;
		position: relative;
		padding: 25px;
	}

	.dropdown-list {
		position: absolute;
		flex-direction: column;
		left: -10px;
		top: 50px;
	}
	.dropdown-item {
		padding: 10px;
		white-space: nowrap;
	}
</style>
