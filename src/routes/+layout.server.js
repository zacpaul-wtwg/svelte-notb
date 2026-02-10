import { loadCmsData } from '$lib/cms/loadCmsData';

export const prerender = false;

export async function load({ fetch }) {
	const allData = await loadCmsData(fetch);
	return { allData };
}
