import { loadCmsData } from '$lib/cms/loadCmsData';

export const prerender = true;

export async function load({ fetch }) {
	const allData = await loadCmsData(fetch);
	let productsData = { things: { products: [], availableFilters: {}, departments: [] } };

	try {
		const res = await fetch('/data/getAllProducts');
		if (res.ok) {
			productsData = await res.json();
		}
	} catch {
		// Keep defaults when Comcash data is unavailable.
	}

	return { allData, productsData };
}
