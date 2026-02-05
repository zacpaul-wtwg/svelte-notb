// Netlify Function: fetch current `static/cms.json` from GitHub.
//
// This exists so the `/cms-admin` page doesn't reveal content until the
// shared password is entered.
//
// Required env vars (set in Netlify):
// - CMS_ADMIN_PASSWORD
// - GITHUB_TOKEN
// - GITHUB_REPO: "owner/repo"
//
// Optional:
// - GITHUB_BRANCH (default: "main")
//
// Endpoint: POST /.netlify/functions/get-cms-json

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

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const adminPassword = process.env.CMS_ADMIN_PASSWORD;
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO;
  const githubBranch = process.env.GITHUB_BRANCH || 'main';

  if (!adminPassword || !githubToken || !githubRepo) {
    return json(500, {
      error: 'Server not configured',
      missing: {
        CMS_ADMIN_PASSWORD: !adminPassword,
        GITHUB_TOKEN: !githubToken,
        GITHUB_REPO: !githubRepo,
      },
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const password = payload.password;
  if (!safeEqual(String(password || ''), adminPassword)) {
    return json(401, { error: 'Unauthorized' });
  }

  const apiBase = `https://api.github.com/repos/${githubRepo}/contents/static/cms.json`;
  const headers = {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${githubToken}`,
    'user-agent': 'notbfireworks-cms-updater',
    'x-github-api-version': '2022-11-28',
  };

  try {
    const res = await fetch(`${apiBase}?ref=${encodeURIComponent(githubBranch)}`, { headers });
    const text = await res.text();
    if (!res.ok) {
      return json(502, { error: 'Failed to read cms.json from GitHub', status: res.status, text });
    }

    const data = JSON.parse(text);
    const contentB64 = data?.content;
    if (typeof contentB64 !== 'string') {
      return json(502, { error: 'Unexpected GitHub response (missing content)' });
    }

    const decoded = Buffer.from(contentB64.replace(/\n/g, ''), 'base64').toString('utf8');
    return json(200, { ok: true, content: decoded, sha: data?.sha || null });
  } catch (e) {
    return json(502, { error: 'Network error reading GitHub', details: String(e?.message || e) });
  }
};

