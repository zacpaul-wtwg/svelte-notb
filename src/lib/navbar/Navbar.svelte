<script>
	export let allData;
	export const navItems = [
		{
			label: 'Home',
			link: '/',
			class: 'nav-link'
		},
		{
			label: 'Products',
			link: '/products',
			class: 'nav-link'
		},
		{
			label: 'Pricing',
			link: '/pricing',
			class: 'nav-link'
		},
		{
			label: 'FAQ',
			link: '/faq',
			class: 'nav-link'
		},
		{
			label: 'Contact',
			link: '/contact',
			class: 'nav-link'
		}
	];
</script>

<nav>
	<ul class="nav-list">
		<li>
			<img src="https://via.placeholder.com/150x60.png?text=logo" alt="North of the Border Logo" />
		</li>
		{#each navItems as item}
			<li class={item.class}>
				<a href={item.link}>{item.label}</a>
			</li>
		{/each}
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
