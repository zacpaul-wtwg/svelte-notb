import { fallbackAllData } from '$lib/cms/fallback';
import { normalizeCmsData } from '$lib/cms/normalize';
import { building } from '$app/environment';

export async function loadCmsData(fetch) {
	let allData = fallbackAllData;

	try {
		// During prerender/build, runtime endpoints are unavailable.
		// Use static fallback for build output; use runtime CMS endpoint in deployed app.
		const endpoint = building ? '/cms.json' : '/data/cms';
		const res = await fetch(endpoint, { cache: 'no-store' });
		const contentType = res.headers.get('content-type') ?? '';
		if (res.ok && contentType.includes('application/json')) {
			const parsed = await res.json();
			// Support both shapes in case callers return { allData }.
			allData = normalizeCmsData(parsed?.allData ?? parsed ?? fallbackAllData);
		}
	} catch {
		// Keep fallback data if cms.json cannot be loaded.
	}

	return allData;
}
