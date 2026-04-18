import { loadCmsData } from '$lib/cms/loadCmsData';

export const prerender = false;

export async function load({ fetch }) {
	return {
		allData: await loadCmsData(fetch)
	};
}
