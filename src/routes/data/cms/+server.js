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
		const details = await runtimeRes.json().catch(() => ({}));
		return json(
			{
				error: 'Failed to load CMS content from public Blob endpoint',
				upstreamStatus: runtimeRes.status,
				details
			},
			{ status: runtimeRes.status || 503 }
		);
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
