import { fallbackAllData as fallbackAllDataModule } from '$lib/cms/fallback';

export async function load({ fetch }) {
	let allData = fallbackAllDataModule;
	try {
		const res = await fetch('/data/cms');
		const contentType = res.headers.get('content-type') ?? '';
		if (res.ok && contentType.includes('application/json')) {
			const parsed = await res.json();
			if (parsed?.allData) allData = parsed.allData;
		}
	} catch {
		// keep fallback
	}

	const productsData = await fetch('/data/getAllProducts').then((results) => results.json());

	return { allData, productsData };
}
