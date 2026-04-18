import { browser } from '$app/environment';
import { normalizeCmsData } from '$lib/cms/normalize';

function getRuntimeCmsUrl() {
	if (typeof window === 'undefined') return '/data/cms';
	const pageUrl = new URL(window.location.href);
	const previewToken = pageUrl.searchParams.get('preview');
	const url = new URL('/data/cms', pageUrl.origin);
	url.searchParams.set('ts', previewToken || Date.now().toString());
	if (previewToken) url.searchParams.set('preview', previewToken);
	return `${url.pathname}${url.search}`;
}

export async function fetchRuntimeCms() {
	if (!browser) return null;
	try {
		const res = await fetch(getRuntimeCmsUrl(), {
			cache: 'no-store',
			headers: {
				'cache-control': 'no-store',
				pragma: 'no-cache'
			}
		});
		if (!res.ok) return null;
		const parsed = await res.json();
		return normalizeCmsData(parsed?.allData ?? parsed ?? null);
	} catch {
		return null;
	}
}
