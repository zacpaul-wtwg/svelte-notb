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
	import Navbar from '$lib/navbar/Navbar.svelte';

	export let allData;
	import '../app.css';
	import FooterDescription from '$lib/footer/FooterDescription.svelte';
	console.log(allData);
</script>

<header>
	<Navbar />
</header>
<main>
	<slot />
</main>
<footer>
	<FooterDescription {allData} />
</footer>
