<script>
import Navbar from '$lib/components/Navbar.svelte';
import '../app.css';
import Footer from '$lib/components/Footer.svelte';
import { fallbackAllData } from '$lib/cms/fallback';

export let data;
$: allData = data?.allData ?? fallbackAllData;
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
