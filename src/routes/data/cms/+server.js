import fs from 'node:fs/promises';
import path from 'node:path';
import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getStore } from '@netlify/blobs';

export const prerender = false;

const STORE_NAME = env.CMS_BLOBS_STORE || 'cms-content';
const LIVE_KEY = 'live.json';

const sanitizeBranch = (value) => {
	if (typeof value !== 'string') return '';
	const branch = value.trim();
	if (!branch) return '';
	if (branch.startsWith('/') || branch.includes('..')) return '';
	if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch)) return '';
	return branch;
};

const normalizeBranchForKey = (branch) => sanitizeBranch(branch || 'dev').replace(/[\\/]/g, '--');
const previewKeyForBranch = (branch) => `preview/${normalizeBranchForKey(branch)}.json`;

const readStaticCms = async () => {
	const cmsPath = path.resolve('static', 'cms.json');
	const raw = await fs.readFile(cmsPath, 'utf-8');
	return JSON.parse(raw);
};

const detectBranch = () =>
	env.CMS_TARGET_BRANCH || env.GITHUB_BRANCH || env.BRANCH || env.HEAD || 'dev';

const readRuntimeCms = async () => {
	const store = getStore(STORE_NAME);
	const branch = detectBranch();
	const previewKey = previewKeyForBranch(branch);

	let allData = await store.get(previewKey, { type: 'json' });
	let source = previewKey;

	if (!allData) {
		allData = await store.get(LIVE_KEY, { type: 'json' });
		source = LIVE_KEY;
	}

	return { allData, source, previewKey, branch };
};

export async function GET({ fetch }) {
	try {
		if (dev) {
			const allData = await readStaticCms();
			return json({ allData, source: 'static/cms.json' });
		}

		const runtime = await readRuntimeCms();
		if (runtime.allData) {
			return json(
				{
					allData: runtime.allData,
					source: runtime.source
				},
				{
					headers: {
						'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
					}
				}
			);
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
