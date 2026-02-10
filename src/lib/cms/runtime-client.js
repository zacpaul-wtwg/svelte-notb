import { browser } from '$app/environment';

export async function fetchRuntimeCms() {
	if (!browser) return null;
	try {
		const res = await fetch('/data/cms', { cache: 'no-store' });
		if (!res.ok) return null;
		const parsed = await res.json();
		return parsed?.allData ?? parsed ?? null;
	} catch {
		return null;
	}
}
