<script context="module">
	import { fallbackAllData as fallbackAllDataModule } from '$lib/cms/fallback';

	export async function load({ fetch }) {
		let allData = fallbackAllDataModule;

		// CMS failures should not take down the site (especially while migrating off Contentful).
		// Only attempt JSON parsing when the response is successful and looks like JSON.
		try {
			const res = await fetch('/data/getAllContentful.json');
			const contentType = res.headers.get('content-type') ?? '';
			if (res.ok && contentType.includes('application/json')) {
				const parsed = await res.json();
				if (parsed?.allData) allData = parsed.allData;
			}
		} catch {
			// keep fallback
		}

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
	import { fallbackAllData } from '$lib/cms/fallback';
	import { page } from '$app/stores';
	export let allData = fallbackAllData;

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
