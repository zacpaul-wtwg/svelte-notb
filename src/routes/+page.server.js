import { loadCmsData } from '$lib/cms/loadCmsData';

export async function load({ fetch }) {
	const allData = await loadCmsData(fetch);

	const productsData = await fetch('/data/getAllProducts').then((results) => results.json());

	return { allData, productsData };
}
