// Netlify Function: fetch CMS JSON from Netlify Blobs.
//
// Required env vars:
// - CMS_ADMIN_PASSWORD
//
// Optional env vars:
// - CMS_BLOBS_STORE (default: "cms-content")
// - CMS_TARGET_BRANCH
// - GITHUB_BRANCH
// - BRANCH / HEAD (provided by Netlify deploy context)
//
// Endpoint: POST /.netlify/functions/get-cms-json

const { connectLambda, getStore } = require('@netlify/blobs');
const { normalizeCmsData } = require('../lib/cms-normalize.cjs');

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function isCmsEnabled() {
  const raw = String(process.env.CMS_ADMIN_ENABLED || '').trim().toLowerCase();
  if (!raw) return true;
  return raw === 'true' || raw === '1' || raw === 'yes';
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function sanitizeBranch(value) {
  if (typeof value !== 'string') return '';
  const branch = value.trim();
  if (!branch) return '';
  if (branch.startsWith('/') || branch.includes('..')) return '';
  if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch)) return '';
  return branch;
}

function sanitizeSource(value) {
  const source = String(value || '').trim().toLowerCase();
  if (source === 'live' || source === 'preview' || source === 'auto') return source;
  return 'auto';
}

function getTargetBranch() {
  return (
    process.env.CMS_TARGET_BRANCH ||
    process.env.GITHUB_BRANCH ||
    process.env.BRANCH ||
    process.env.HEAD ||
    'dev'
  );
}

function getStoreName() {
  return process.env.CMS_BLOBS_STORE || 'cms-content';
}

function previewKeyForBranch(branch) {
  const safe = sanitizeBranch(branch) || 'dev';
  const normalized = safe.replace(/[\\/]/g, '--');
  return `preview/${normalized}.json`;
}

function runtimeBranchInfo(targetBranch) {
  return {
    targetBranch,
    context: process.env.CONTEXT || null,
    branch: process.env.BRANCH || null,
    head: process.env.HEAD || null,
  };
}

async function readCmsFromSiteFallback(event) {
  const host = event.headers['x-forwarded-host'] || event.headers.host;
  if (!host) return null;

  const proto = event.headers['x-forwarded-proto'] || 'https';
  const url = `${proto}://${host}/cms.json`;

  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }
  if (!isCmsEnabled()) {
    return json(404, { error: 'Not found' });
  }

  const adminPassword = process.env.CMS_ADMIN_PASSWORD;
  if (!adminPassword) {
    return json(500, {
      error: 'Server not configured',
      missing: { CMS_ADMIN_PASSWORD: true },
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const password = payload.password;
  const requestedBranch = sanitizeBranch(payload.targetBranch);
  const requestedSource = sanitizeSource(payload.source);
  const targetBranch = requestedBranch || getTargetBranch();
  const branchInfo = {
    ...runtimeBranchInfo(targetBranch),
    requestedBranch: requestedBranch || null,
    requestedSource,
  };

  if (!safeEqual(String(password || ''), adminPassword)) {
    return json(401, { error: 'Unauthorized' });
  }

  try {
    connectLambda(event);
    const store = getStore(getStoreName());
    const liveKey = 'live.json';
    const previewKey = previewKeyForBranch(targetBranch);

    let allData = null;
    let source = '';

    if (requestedSource === 'live') {
      allData = await store.get(liveKey, { type: 'json' });
      source = liveKey;
      if (!allData) {
        allData = await readCmsFromSiteFallback(event);
        source = 'site-fallback:/cms.json';
      }
    } else {
      let shouldSeedPreview = false;
      allData = await store.get(previewKey, { type: 'json' });
      source = previewKey;

      if (!allData) {
        allData = await store.get(liveKey, { type: 'json' });
        source = liveKey;
        shouldSeedPreview = Boolean(allData);
      }

      if (!allData) {
        allData = await readCmsFromSiteFallback(event);
        source = 'site-fallback:/cms.json';
        shouldSeedPreview = Boolean(allData);
      }

      if (allData && shouldSeedPreview && requestedSource !== 'live') {
        allData = normalizeCmsData(allData);
        await store.setJSON(previewKey, allData, {
          metadata: { source, initializedAt: new Date().toISOString() },
        });
        source = `${previewKey} (initialized from ${source})`;
      }
    }

    if (!allData) {
      return json(404, { error: 'No CMS content found', branchInfo });
    }

    return json(200, {
      ok: true,
      content: JSON.stringify(normalizeCmsData(allData), null, 2),
      branchInfo,
      source,
    });
  } catch (e) {
    return json(502, {
      error: 'Failed to read CMS content from Netlify Blobs',
      details: String(e?.message || e),
      branchInfo,
    });
  }
};
