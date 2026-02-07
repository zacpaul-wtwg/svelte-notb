<script>
import Navbar from '$lib/components/Navbar.svelte';
import '../app.css';
import Footer from '$lib/components/Footer.svelte';
import { fallbackAllData } from '$lib/cms/fallback';
import { page } from '$app/stores';

export let data;
$: allData = data?.allData ?? fallbackAllData;
$: isCmsAdmin = $page.url.pathname.startsWith('/cms-admin');
</script>

{#if !isCmsAdmin}
	<header>
		<Navbar />
	</header>
{/if}

<main>
	<slot />
</main>

{#if !isCmsAdmin}
	<Footer {allData} />
{/if}

<style>
	header {
		height: var(--header);
	}
	main {
		min-height: 75vh;
	}
</style>
