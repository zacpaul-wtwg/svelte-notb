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

export async function GET() {
	try {
		const allData = await readStaticCms();
		return json({ allData });
	} catch {
		return json({ error: 'cms.json missing or unreadable' }, { status: 503 });
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
