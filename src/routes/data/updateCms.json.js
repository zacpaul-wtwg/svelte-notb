import fs from 'node:fs/promises';
import path from 'node:path';

const cmsPath = path.resolve('static', 'cms.json');
const requiredKeys = [
	'newsPosts',
	'footerDescription',
	'hours',
	'regularHoursStrict',
	'faq',
	'pricing',
	'specialHours',
	'closedRange'
];

export async function post({ request }) {
	// Local-only feedback loop: allow writing cms.json on the dev server.
	// In production, the filesystem is immutable and this would be a security risk anyway.
	if (process.env.NODE_ENV === 'production') {
		return {
			status: 404,
			body: { error: 'Not available' }
		};
	}

	let payload;
	try {
		payload = await request.json();
	} catch {
		return {
			status: 400,
			body: { error: 'Invalid JSON body' }
		};
	}

	const allData = payload?.allData;
	if (!allData || typeof allData !== 'object') {
		return {
			status: 400,
			body: { error: 'Missing allData' }
		};
	}

	for (const k of requiredKeys) {
		if (!(k in allData)) {
			return {
				status: 400,
				body: { error: `cms.json missing required key: ${k}` }
			};
		}
	}

	if (typeof allData.newsPosts !== 'object' || allData.newsPosts === null) {
		return { status: 400, body: { error: 'newsPosts must be an object' } };
	}
	if (typeof allData.footerDescription !== 'object' || allData.footerDescription === null) {
		return { status: 400, body: { error: 'footerDescription must be an object' } };
	}
	if (typeof allData.hours !== 'object' || allData.hours === null) {
		return { status: 400, body: { error: 'hours must be an object' } };
	}
	if (typeof allData.regularHoursStrict !== 'object' || allData.regularHoursStrict === null) {
		return { status: 400, body: { error: 'regularHoursStrict must be an object' } };
	}
	if (!Array.isArray(allData.faq)) return { status: 400, body: { error: 'faq must be an array' } };
	if (!Array.isArray(allData.pricing)) return { status: 400, body: { error: 'pricing must be an array' } };
	if (!Array.isArray(allData.specialHours))
		return { status: 400, body: { error: 'specialHours must be an array' } };
	if (!Array.isArray(allData.closedRange))
		return { status: 400, body: { error: 'closedRange must be an array' } };

	try {
		const pretty = JSON.stringify(allData, null, 2) + '\n';
		await fs.writeFile(cmsPath, pretty, 'utf-8');
		return {
			status: 200,
			body: { ok: true }
		};
	} catch (e) {
		return {
			status: 500,
			body: { error: 'Failed to write cms.json', details: String(e?.message || e) }
		};
	}
}
