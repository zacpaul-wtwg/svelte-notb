import { fallbackAllData } from '$lib/cms/fallback';

export async function loadCmsData(fetch) {
	let allData = fallbackAllData;

	try {
		const res = await fetch('/cms.json', { cache: 'no-store' });
		const contentType = res.headers.get('content-type') ?? '';
		if (res.ok && contentType.includes('application/json')) {
			const parsed = await res.json();
			// Support both shapes in case callers return { allData }.
			allData = parsed?.allData ?? parsed ?? fallbackAllData;
		}
	} catch {
		// Keep fallback data if cms.json cannot be loaded.
	}

	return allData;
}
