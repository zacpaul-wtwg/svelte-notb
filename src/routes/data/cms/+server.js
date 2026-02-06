import fs from 'node:fs/promises';
import path from 'node:path';
import { json } from '@sveltejs/kit';

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
