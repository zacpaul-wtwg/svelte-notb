// Netlify Function: update CMS JSON in Netlify Blobs.
//
// Required env vars:
// - CMS_ADMIN_PASSWORD
//
// Optional env vars:
// - CMS_PUBLISH_PASSWORD
// - CMS_BLOBS_STORE (default: "cms-content")
// - CMS_TARGET_BRANCH
// - GITHUB_BRANCH
// - BRANCH / HEAD (provided by Netlify deploy context)
//
// Endpoint: POST /.netlify/functions/update-cms-json

const { connectLambda, getStore } = require('@netlify/blobs');

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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }
  if (!isCmsEnabled()) {
    return json(404, { error: 'Not found' });
  }

  const adminPassword = process.env.CMS_ADMIN_PASSWORD;
  const publishPassword = process.env.CMS_PUBLISH_PASSWORD || '';

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
  const raw = payload.content;
  const isPublish = payload.publish === true;
  const requestedBranch = sanitizeBranch(payload.targetBranch);
  const targetBranch = requestedBranch || getTargetBranch();
  const expectedPassword = isPublish ? publishPassword || adminPassword : adminPassword;

  if (!safeEqual(String(password || ''), expectedPassword)) {
    return json(401, { error: 'Unauthorized' });
  }

  if (typeof raw !== 'string' || !raw.trim()) {
    return json(400, { error: 'Missing content' });
  }

  let allData;
  try {
    allData = JSON.parse(raw);
  } catch (e) {
    return json(400, { error: 'cms.json must be valid JSON', details: String(e?.message || e) });
  }

  const liveKey = 'live.json';
  const previewKey = previewKeyForBranch(targetBranch);
  const writeKey = isPublish ? liveKey : previewKey;
  const branchInfo = {
    ...runtimeBranchInfo(targetBranch),
    requestedBranch: requestedBranch || null,
    publish: isPublish,
  };

  try {
    connectLambda(event);
    const store = getStore(getStoreName());

    const metadata = {
      updatedAt: new Date().toISOString(),
      targetBranch,
      publish: isPublish,
      source: 'cms-admin',
    };

    await store.setJSON(writeKey, allData, { metadata });

    return json(200, {
      ok: true,
      branchInfo,
      key: writeKey,
      updatedAt: metadata.updatedAt,
      message: isPublish
        ? `Published live content to ${liveKey}`
        : `Saved preview content to ${previewKey}`,
    });
  } catch (e) {
    return json(502, {
      error: 'Failed to write CMS content to Netlify Blobs',
      details: String(e?.message || e),
      branchInfo,
    });
  }
};
