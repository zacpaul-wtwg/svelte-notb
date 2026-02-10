import fs from 'node:fs/promises';
import path from 'node:path';
import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const prerender = false;

const readStaticCms = async () => {
	const cmsPath = path.resolve('static', 'cms.json');
	const raw = await fs.readFile(cmsPath, 'utf-8');
	return JSON.parse(raw);
};

export async function GET({ fetch }) {
	try {
		if (dev) {
			const allData = await readStaticCms();
			return json({ allData, source: 'static/cms.json' });
		}

		const runtimeRes = await fetch('/.netlify/functions/get-public-cms-json', {
			cache: 'no-store'
		});
		if (runtimeRes.ok) {
			const parsed = await runtimeRes.json();
			return json(parsed, {
				headers: {
					'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
				}
			});
		}

		// Final fallback for first-time migration: serve the built static copy if present.
		const res = await fetch('/cms.json', { cache: 'no-store' });
		if (res.ok) {
			const parsed = await res.json();
			return json({ allData: parsed, source: 'fallback:/cms.json' });
		}

		return json({ error: 'CMS content not found in Blobs or static fallback' }, { status: 503 });
	} catch (e) {
		return json(
			{ error: 'cms content missing or unreadable', details: String(e?.message || e) },
			{ status: 503 }
		);
	}
}

export async function POST({ request }) {
	if (!dev) {
		return json({ error: 'Not allowed in production' }, { status: 403 });
	}
	try {
		const payload = await request.json();
		if (!payload?.allData) {
			return json({ error: 'Missing allData' }, { status: 400 });
		}
		const cmsPath = path.resolve('static', 'cms.json');
		await fs.writeFile(cmsPath, JSON.stringify(payload.allData, null, 2));
		return json({ ok: true });
	} catch (e) {
		return json({ error: 'Failed to write cms.json', details: String(e?.message || e) }, { status: 500 });
	}
}
