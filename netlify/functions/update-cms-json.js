// Netlify Function: update `static/cms.json` in the GitHub repo.
//
// This gives you a "thin form" on the site that can update content without
// granting GitHub repo access to editors.
//
// Required env vars (set in Netlify):
// - CMS_ADMIN_PASSWORD: shared password for the form
// - GITHUB_TOKEN: a GitHub PAT with `contents:write` (or repo contents write) for this repo
// - CMS_REPO_B64: base64("owner/repo")
//
// Optional env vars:
// - CMS_TARGET_BRANCH (preferred)
// - GITHUB_BRANCH
// - BRANCH / HEAD (provided by Netlify deploy context)
//   Fallback defaults to "main"
//
// Endpoint: POST /.netlify/functions/update-cms-json

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
  // Constant-time-ish compare for same-length strings.
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function decodeBase64Value(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    return Buffer.from(value, 'base64').toString('utf8').trim();
  } catch {
    return '';
  }
}

function getTargetBranch() {
  return (
    process.env.CMS_TARGET_BRANCH ||
    process.env.GITHUB_BRANCH ||
    process.env.BRANCH ||
    process.env.HEAD ||
    'main'
  );
}

function sanitizeBranch(value) {
  if (typeof value !== 'string') return '';
  const branch = value.trim();
  if (!branch) return '';
  if (branch.startsWith('/') || branch.includes('..')) return '';
  if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch)) return '';
  return branch;
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
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = decodeBase64Value(process.env.CMS_REPO_B64);

  if (!adminPassword || !githubToken || !githubRepo) {
    return json(500, {
      error: 'Server not configured',
      missing: {
        CMS_ADMIN_PASSWORD: !adminPassword,
        GITHUB_TOKEN: !githubToken,
        CMS_REPO_B64: !githubRepo,
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
  const raw = payload.content;
  const isPublish = payload.publish === true;
  const requestedBranch = sanitizeBranch(payload.targetBranch);
  const githubBranch = isPublish ? 'main' : requestedBranch || getTargetBranch();
  const branchInfo = {
    ...runtimeBranchInfo(githubBranch),
    requestedBranch: requestedBranch || null,
    publish: isPublish,
  };
  const commitMessage =
    typeof payload.message === 'string' && payload.message.trim()
      ? payload.message.trim().slice(0, 200)
      : isPublish
      ? 'Publish cms.json to main via site form'
      : 'Update cms.json via site form';

  const expectedPassword = isPublish ? publishPassword || adminPassword : adminPassword;
  if (!safeEqual(String(password || ''), expectedPassword)) {
    return json(401, { error: 'Unauthorized' });
  }

  if (typeof raw !== 'string' || !raw.trim()) {
    return json(400, { error: 'Missing content' });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return json(400, { error: 'cms.json must be valid JSON', details: String(e?.message || e) });
  }

  const pretty = JSON.stringify(parsed, null, 2) + '\n';
  const b64 = Buffer.from(pretty, 'utf8').toString('base64');

  const apiBase = `https://api.github.com/repos/${githubRepo}/contents/static/cms.json`;
  const headers = {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${githubToken}`,
    'user-agent': 'notbfireworks-cms-updater',
    'x-github-api-version': '2022-11-28',
  };

  // Get current file SHA (required to update).
  let sha;
  try {
    const res = await fetch(`${apiBase}?ref=${encodeURIComponent(githubBranch)}`, { headers });
    if (res.status === 404) {
      sha = undefined;
    } else if (!res.ok) {
      const text = await res.text();
      return json(502, { error: 'Failed to read current cms.json from GitHub', status: res.status, text });
    } else {
      const current = await res.json();
      sha = current.sha;
    }
  } catch (e) {
    return json(502, { error: 'Network error reading GitHub', details: String(e?.message || e) });
  }

  // Update (or create) the file via GitHub Contents API.
  try {
    const body = {
      message: commitMessage,
      content: b64,
      branch: githubBranch,
      ...(sha ? { sha } : {}),
    };

    const res = await fetch(apiBase, {
      method: 'PUT',
      headers: { ...headers, 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      return json(502, {
        error: 'Failed to write cms.json to GitHub',
        status: res.status,
        text,
        branchInfo,
      });
    }

    const out = JSON.parse(text);
    return json(200, {
      ok: true,
      commit: out?.commit?.html_url || null,
      contentPath: out?.content?.path || 'static/cms.json',
      branchInfo,
    });
  } catch (e) {
    return json(502, {
      error: 'Network error writing GitHub',
      details: String(e?.message || e),
      branchInfo,
    });
  }
};
