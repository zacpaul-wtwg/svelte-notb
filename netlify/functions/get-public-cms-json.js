// Netlify Function: public CMS JSON fetch from Netlify Blobs.
//
// Optional env vars:
// - CMS_BLOBS_STORE (default: "cms-content")
// - CMS_TARGET_BRANCH
// - GITHUB_BRANCH
// - BRANCH / HEAD (provided by Netlify deploy context)
//
// Endpoint: GET /.netlify/functions/get-public-cms-json

const { connectLambda, getStore } = require('@netlify/blobs');

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
    },
    body: JSON.stringify(body),
  };
}

function sanitizeBranch(value) {
  if (typeof value !== 'string') return '';
  const branch = value.trim();
  if (!branch) return '';
  if (branch.startsWith('/') || branch.includes('..')) return '';
  if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch)) return '';
  return branch;
}

function normalizeBranchForKey(branch) {
  return (sanitizeBranch(branch) || 'dev').replace(/[\\/]/g, '--');
}

function previewKeyForBranch(branch) {
  return `preview/${normalizeBranchForKey(branch)}.json`;
}

function branchAliases(branch) {
  const safe = sanitizeBranch(branch);
  if (!safe) return [];
  if (safe === 'dev') return ['dev', 'develop'];
  if (safe === 'develop') return ['develop', 'dev'];
  return [safe];
}

function detectBranchFromHost(event) {
  const host = event?.headers?.['x-forwarded-host'] || event?.headers?.host || '';
  if (!host.includes('.netlify.app') || !host.includes('--')) return '';
  const prefix = host.split('--')[0] || '';
  if (/^[a-f0-9]{20,}$/i.test(prefix)) return '';
  return sanitizeBranch(prefix);
}

function detectEnvBranch() {
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    connectLambda(event);
    const store = getStore(getStoreName());
    const hostBranch = detectBranchFromHost(event);
    const envBranch = sanitizeBranch(detectEnvBranch());
    const candidateKeys = [hostBranch, envBranch, 'dev', 'develop', 'main']
      .flatMap((branch) => branchAliases(branch))
      .filter((value, index, arr) => value && arr.indexOf(value) === index)
      .map((branch) => previewKeyForBranch(branch));

    for (const key of candidateKeys) {
      const allData = await store.get(key, { type: 'json' });
      if (allData) return json(200, { allData, source: key });
    }

    const liveData = await store.get('live.json', { type: 'json' });
    if (liveData) return json(200, { allData: liveData, source: 'live.json' });

    return json(404, { error: 'No CMS content found in Blobs' });
  } catch (e) {
    return json(502, {
      error: 'Failed to read CMS content from Netlify Blobs',
      details: String(e?.message || e),
    });
  }
};
