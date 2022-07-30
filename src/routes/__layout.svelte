<script context="module">
	export async function load({ fetch }) {
		const { allData } = await fetch('/data/getAllContentful.json').then((results) => {
			return results.json();
		});

		return {
			props: {
				allData
			}
		};
	}
</script>

<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	export let allData;
</script>

<header>
	<Navbar />
</header>

<main>
	<slot />
</main>

<Footer {allData} />

<style>
	header {
		height: var(--header);
	}
	main {
		min-height: 75vh;
	}
</style>
