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

const branchAliases = (branch) => {
	const safe = sanitizeBranch(branch);
	if (!safe) return [];
	if (safe === 'dev') return ['dev', 'develop'];
	if (safe === 'develop') return ['develop', 'dev'];
	return [safe];
};

const detectBranchFromHost = (request) => {
	const host = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host') || '';
	if (!host.includes('.netlify.app') || !host.includes('--')) return '';
	const prefix = host.split('--')[0] || '';
	// Deploy-id subdomains are long hex strings, not branch names.
	if (/^[a-f0-9]{20,}$/i.test(prefix)) return '';
	return sanitizeBranch(prefix);
};

const readRuntimeCms = async (request) => {
	const store = getStore(STORE_NAME);
	const hostBranch = detectBranchFromHost(request);
	const envBranch = sanitizeBranch(detectBranch());
	const candidates = [hostBranch, envBranch, 'dev', 'develop', 'main']
		.flatMap((branch) => branchAliases(branch))
		.filter((value, idx, arr) => arr.indexOf(value) === idx)
		.map((branch) => previewKeyForBranch(branch));

	for (const key of candidates) {
		const allData = await store.get(key, { type: 'json' });
		if (allData) {
			return { allData, source: key, branch: key.replace(/^preview\/|\.json$/g, '') };
		}
	}

	const liveData = await store.get(LIVE_KEY, { type: 'json' });
	if (liveData) {
		return { allData: liveData, source: LIVE_KEY, branch: 'live' };
	}

	return { allData: null, source: null, branch: hostBranch || envBranch || 'unknown' };
};

export async function GET({ fetch, request }) {
	try {
		if (dev) {
			const allData = await readStaticCms();
			return json({ allData, source: 'static/cms.json' });
		}

		const runtime = await readRuntimeCms(request);
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
