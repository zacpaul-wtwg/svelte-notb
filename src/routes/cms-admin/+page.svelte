<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cmsSections } from '$lib/cms/adminSchema';
	import {
		clearDraftStorage,
		loadDraftFromStorage,
		loadPasswordFromSession,
		saveDraftToStorage,
		savePasswordToSession
	} from '$lib/cms/adminDraft';

	let password = '';
	let status = '';
	let busy = false;
	let publishing = false;
	let unlocked = false;
	let allData = null;
	let message = '';
	let targetBranch = '';
	let reviewDialogOpen = false;
	let diffRows = [];
	let diffOverflowCount = 0;
	let diffSummary = { changed: 0, added: 0, removed: 0 };

	const BRANCH_STORAGE_KEY = 'cms_target_branch';
	const BASELINE_STORAGE_KEY = 'cms_baseline_data';
	const MAX_DIFF_ROWS = 200;

	function inferBranchFromHost() {
		if (typeof window === 'undefined') return '';
		const params = new URLSearchParams(window.location.search);
		const fromQuery = (params.get('branch') || params.get('targetBranch') || '').trim();
		if (fromQuery) return fromQuery;
		const host = window.location.hostname;
		if (!host.endsWith('.netlify.app')) return '';
		if (!host.includes('--')) return '';
		const prefix = host.split('--')[0] || '';
		// Deploy-id subdomains are long hex strings, not branch names.
		if (/^[a-f0-9]{20,}$/i.test(prefix)) return '';
		return prefix;
	}

	const isLocalDev =
		typeof window !== 'undefined' &&
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

	onMount(async () => {
		password = loadPasswordFromSession();
		message = `Update cms.json (${new Date().toISOString().slice(0, 10)})`;
		const inferredBranch = inferBranchFromHost();
		if (inferredBranch) {
			targetBranch = inferredBranch;
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem(BRANCH_STORAGE_KEY, inferredBranch);
			}
		}
		targetBranch =
			typeof window !== 'undefined' ? window.sessionStorage.getItem(BRANCH_STORAGE_KEY) || targetBranch : targetBranch;

		const draft = loadDraftFromStorage();
		if (draft) {
			allData = normalizePricing(draft);
			saveDraftToStorage(allData);
			loadBaselineFromSession();
			unlocked = true;
			status = isLocalDev ? 'Draft loaded (local).' : 'Draft loaded.';
			return;
		}

		if (isLocalDev) {
			await reloadFromDisk();
			unlocked = true;
		}
	});

	const cloneData = (value) => JSON.parse(JSON.stringify(value ?? null));

	function loadBaselineFromSession() {
		if (typeof window === 'undefined') return null;
		try {
			const raw = window.sessionStorage.getItem(BASELINE_STORAGE_KEY);
			if (!raw) return null;
			return normalizePricing(JSON.parse(raw));
		} catch {
			return null;
		}
	}

	function saveBaselineToSession(value) {
		if (typeof window === 'undefined') return;
		try {
			window.sessionStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(value ?? null));
		} catch {
			// ignore storage write failures
		}
	}

	function setTargetBranch(data) {
		if (data?.branchInfo?.publish === true) return;
		const next = String(data?.branchInfo?.targetBranch || '').trim();
		if (!next) return;
		targetBranch = next;
		if (typeof window !== 'undefined') {
			window.sessionStorage.setItem(BRANCH_STORAGE_KEY, next);
		}
	}

	async function reloadFromDisk() {
		status = '';
		busy = true;
		try {
			const res = await fetch('/cms.json', { cache: 'no-store' });
			const text = await res.text();
			allData = normalizePricing(JSON.parse(text));
			saveDraftToStorage(allData);
			saveBaselineToSession(allData);
			status = 'Loaded from /cms.json';
		} catch (e) {
			status = `Failed to load /cms.json: ${e?.message || e}`;
		} finally {
			busy = false;
		}
	}

	async function unlockProd() {
		status = '';
		busy = true;
		try {
			if (!password) {
				status = 'Enter the password to unlock.';
				return;
			}
			const res = await fetch('/.netlify/functions/get-cms-json', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password, targetBranch: inferBranchFromHost() || undefined })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				return;
			}
			setTargetBranch(data);

			allData = normalizePricing(JSON.parse(String(data?.content || '{}')));
			saveDraftToStorage(allData);
			saveBaselineToSession(allData);
			savePasswordToSession(password);
			unlocked = true;
			status = 'Unlocked.';
		} catch (e) {
			status = `Network error: ${e?.message || e}`;
		} finally {
			busy = false;
		}
	}

	async function saveDraft({ publish = false } = {}) {
		if (!allData) return;
		status = '';
		if (publish) {
			publishing = true;
		} else {
			busy = true;
		}
		try {
			if (isLocalDev) {
				saveDraftToStorage(allData);
				status = 'Saved to local draft.';
				return;
			}
			if (publish && !confirm('Commit current cms.json to main and trigger live deploy?')) {
				return;
			}
			const res = await fetch('/.netlify/functions/update-cms-json', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					password,
					message: publish ? `Publish cms.json to main (${new Date().toISOString().slice(0, 10)})` : message,
					targetBranch: inferBranchFromHost() || undefined,
					publish,
					content: JSON.stringify(allData, null, 2)
				})
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				return;
			}
			setTargetBranch(data);
			status = publish
				? `Published to main. Commit: ${data?.commit || '(unknown)'}`
				: `Saved to dev preview. Commit: ${data?.commit || '(unknown)'}`;
			saveBaselineToSession(allData);
			openReviewDialog();
		} catch (e) {
			status = `Network error: ${e?.message || e}`;
		} finally {
			busy = false;
			publishing = false;
		}
	}

	function resetDraft() {
		clearDraftStorage();
		allData = null;
		unlocked = false;
		reviewDialogOpen = false;
		status = 'Draft cleared.';
	}

	const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value);

	const formatValue = (value) => {
		if (value === undefined) return 'undefined';
		if (value === null) return 'null';
		if (typeof value === 'string') return value.length > 110 ? `${value.slice(0, 110)}...` : value;
		if (typeof value === 'number' || typeof value === 'boolean') return String(value);
		if (Array.isArray(value)) return `[array length ${value.length}]`;
		if (isRecord(value)) return '{object}';
		return String(value);
	};

	const collectDiffs = (before, after, path = '') => {
		if (Object.is(before, after)) return [];

		if (Array.isArray(before) || Array.isArray(after)) {
			const left = Array.isArray(before) ? before : [];
			const right = Array.isArray(after) ? after : [];
			const length = Math.max(left.length, right.length);
			const out = [];
			for (let i = 0; i < length; i += 1) {
				const nextPath = `${path}[${i}]`;
				if (i >= left.length) {
					out.push({ type: 'added', path: nextPath, before: undefined, after: right[i] });
				} else if (i >= right.length) {
					out.push({ type: 'removed', path: nextPath, before: left[i], after: undefined });
				} else {
					out.push(...collectDiffs(left[i], right[i], nextPath));
				}
			}
			return out;
		}

		if (isRecord(before) && isRecord(after)) {
			const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
			const out = [];
			for (const key of [...keys].sort()) {
				const nextPath = path ? `${path}.${key}` : key;
				if (!(key in before)) {
					out.push({ type: 'added', path: nextPath, before: undefined, after: after[key] });
				} else if (!(key in after)) {
					out.push({ type: 'removed', path: nextPath, before: before[key], after: undefined });
				} else {
					out.push(...collectDiffs(before[key], after[key], nextPath));
				}
			}
			return out;
		}

		return [{ type: 'changed', path: path || '(root)', before, after }];
	};

	function computeDiffState() {
		const current = normalizePricing(loadDraftFromStorage() || allData || {});
		allData = current;
		const baseline = loadBaselineFromSession();
		if (!baseline) {
			saveBaselineToSession(current);
			diffSummary = { changed: 0, added: 0, removed: 0 };
			diffRows = [];
			diffOverflowCount = 0;
			return;
		}
		const allRows = collectDiffs(cloneData(baseline), cloneData(current));
		const summary = { changed: 0, added: 0, removed: 0 };
		allRows.forEach((row) => {
			summary[row.type] += 1;
		});
		diffSummary = summary;
		diffRows = allRows.slice(0, MAX_DIFF_ROWS);
		diffOverflowCount = Math.max(0, allRows.length - MAX_DIFF_ROWS);
	}

	function openReviewDialog() {
		computeDiffState();
		reviewDialogOpen = true;
	}

	function closeReviewDialog() {
		reviewDialogOpen = false;
	}

	function normalizePricing(data) {
		if (!data || !Array.isArray(data.pricing)) return data;
		const marker = '\n\n#### Highlights\n';
		const toText = (s) =>
			String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1');
		const converted = data.pricing.map((item) => {
			if (!item || (item.subtitle && item.highlights)) return item;
			const entry = String(item.entry || '');
			const out = {
				title: item.title || '',
				subtitle: '',
				highlights: [],
				howItWorks: '',
				bestFor: '',
				order: item.order ?? 0
			};
			if (entry.includes(marker)) {
				const [subtitle, rest] = entry.split(marker);
				out.subtitle = toText(subtitle.trim());
				const sections = rest.split('\n\n#### ');
				const highlightsBlock = sections[0] || '';
				out.highlights = highlightsBlock
					.split('\n')
					.map((l) => l.trim())
					.filter(Boolean)
					.map((l) => toText(l.replace(/^[\-•]\s*/, '').trim()));
				for (const sec of sections.slice(1)) {
					const idx = sec.indexOf('\n');
					if (idx === -1) continue;
					const name = sec.slice(0, idx).trim().toLowerCase();
					const body = toText(sec.slice(idx + 1).trim());
					if (name === 'how it works') out.howItWorks = body;
					if (name === 'best for') out.bestFor = body;
				}
			} else {
				out.subtitle = toText(entry.trim());
			}
			return out;
		});
		return { ...data, pricing: converted };
	}
</script>

<svelte:head>
	<title>CMS Admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="wrap">
	<header class="adminTop">
		<div class="adminLeft">
			<button class="navBtn ghost" type="button" disabled>Sections</button>
			<button
				class="navBtn"
				type="button"
				on:click={openReviewDialog}
				disabled={!allData || busy || publishing}
			>
				See Changes Made
			</button>
		</div>
		<div class="adminCenter">
			<a class="logo" href="/">
				<img src="/logo_large.png" alt="North of the Border Logo" />
			</a>
		</div>
		<div class="adminRight">
			<span class="branchBadge">{isLocalDev ? 'target: local' : `target: ${targetBranch || 'unknown'}`}</span>
		</div>
	</header>

	<section class="panel">
		<h1 class="pageTitle">CMS Sections</h1>
		{#if !unlocked && !isLocalDev}
			<label class="label">
				<span>Password</span>
				<input
					class="input"
					type="password"
					bind:value={password}
					autocomplete="current-password"
					on:keydown={(e) => e.key === 'Enter' && password && !busy && unlockProd()}
				/>
			</label>
			<div class="row">
				<button class="btn primary" type="button" on:click={unlockProd} disabled={busy}>
					{busy ? 'Unlocking…' : 'Unlock'}
				</button>
			</div>
		{:else}
			<div class="row">
				{#if isLocalDev}
					<button class="btn" type="button" on:click={reloadFromDisk} disabled={busy}>
						{busy ? 'Loading…' : 'Reload From Disk'}
					</button>
				{/if}
				<button class="btn" type="button" on:click={resetDraft} disabled={busy}>
					Clear Draft
				</button>
				<a class="btn" href="/cms.json" target="_blank" rel="noreferrer">View Live cms.json</a>
			</div>

			<div class="grid">
				{#each cmsSections as section}
					<a class="card" href={`/cms-admin/${section.key}`}>
						<div class="cardTitle">{section.label}</div>
						<div class="cardMeta">
							<code>{section.key}</code>
							<span class="pill">{section.kind}</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		{#if status}
			<p class="status">{status}</p>
		{/if}
	</section>

	{#if reviewDialogOpen}
		<button
			class="reviewOverlay"
			type="button"
			aria-label="Close review dialog"
			transition:fade={{ duration: 140 }}
			on:click={closeReviewDialog}
		></button>
		<div class="reviewDialog" role="dialog" aria-modal="true" aria-label="Review CMS changes" transition:scale={{ duration: 150 }}>
			<div class="reviewHeader">
				<h2>Review Changes</h2>
				<button class="iconBtn" type="button" aria-label="Close dialog" on:click={closeReviewDialog}>×</button>
			</div>
			<p class="reviewMeta">Target preview branch: <strong>{isLocalDev ? 'local' : targetBranch || 'unknown'}</strong></p>
			<p class="reviewMeta">
				Changed: {diffSummary.changed} | Added: {diffSummary.added} | Removed: {diffSummary.removed}
			</p>
			<div class="diffList">
				{#if diffRows.length === 0}
					<p class="emptyDiff">No draft changes detected compared to the last loaded/saved baseline.</p>
				{:else}
					{#each diffRows as row}
						<div class="diffRow">
							<div class="diffPath">{row.path}</div>
							<div class="diffType">{row.type}</div>
							<div class="diffBefore"><span>before</span> {formatValue(row.before)}</div>
							<div class="diffAfter"><span>after</span> {formatValue(row.after)}</div>
						</div>
					{/each}
					{#if diffOverflowCount > 0}
						<p class="overflowNote">Showing first {MAX_DIFF_ROWS} changes. {diffOverflowCount} more not shown.</p>
					{/if}
				{/if}
			</div>
			<div class="reviewActions">
				<button class="btn" type="button" on:click={closeReviewDialog} disabled={busy || publishing}>Cancel</button>
				<button class="btn primary" type="button" on:click={() => saveDraft({ publish: false })} disabled={!allData || busy || publishing}>
					{busy ? 'Saving…' : 'Save to Dev Preview'}
				</button>
				{#if !isLocalDev}
					<button class="btn publishAction" type="button" on:click={() => saveDraft({ publish: true })} disabled={!allData || busy || publishing}>
						{publishing ? 'Publishing…' : 'Commit & Go Live'}
					</button>
				{/if}
			</div>
		</div>
	{/if}
</main>

<style>
	.wrap {
		min-height: 100vh;
		padding: 86px 16px 24px;
		box-sizing: border-box;
		background: radial-gradient(900px 500px at 20% 10%, rgba(255, 199, 0, 0.12), transparent 55%),
			radial-gradient(900px 500px at 80% 0%, rgba(0, 184, 255, 0.12), transparent 55%),
			linear-gradient(180deg, #08080b, #0b0b10);
		color: #eef0f6;
	}

	.adminTop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 20;
		padding: 10px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(8, 8, 11, 0.92);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(10px);
	}
	.adminLeft {
		display: flex;
		gap: 8px;
	}
	.adminCenter {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}
	.adminRight {
		display: flex;
		justify-content: flex-end;
		min-width: 140px;
	}
	.branchBadge {
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		border-radius: 999px;
		padding: 6px 10px;
		font-size: 12px;
		white-space: nowrap;
	}
	.logo img {
		width: 120px;
		height: auto;
		display: block;
	}
	.navBtn {
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		border-radius: 10px;
		padding: 8px 12px;
		font-size: 13px;
		cursor: pointer;
	}
	.navBtn.ghost {
		opacity: 0.7;
		cursor: default;
	}
	.navBtn[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.panel {
		max-width: 1000px;
		margin: 12px auto 0;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 14px;
		background: rgba(255, 255, 255, 0.04);
	}
	.pageTitle {
		margin: 4px 0 12px;
		font-size: 20px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.label {
		display: grid;
		gap: 6px;
		margin: 0 0 12px;
	}
	.label > span {
		font-size: 13px;
		opacity: 0.9;
	}
	.input {
		width: 100%;
		box-sizing: border-box;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(0, 0, 0, 0.22);
		color: #eef0f6;
		padding: 10px 12px;
		font-size: 14px;
	}

	.row {
		display: flex;
		gap: 10px;
		align-items: center;
		margin: 0 0 12px;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 12px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		text-decoration: none;
		cursor: pointer;
		font-size: 14px;
	}
	.btn.primary {
		border-color: rgba(255, 199, 0, 0.42);
		background: linear-gradient(180deg, rgba(255, 199, 0, 0.25), rgba(255, 199, 0, 0.12));
	}
	.btn[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.card {
		padding: 14px;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.05);
		text-decoration: none;
		color: inherit;
		transition: transform 0.15s ease, border-color 0.15s ease;
	}
	.card:hover {
		transform: translateY(-2px);
		border-color: rgba(255, 199, 0, 0.4);
	}
	.cardTitle {
		font-size: 16px;
		margin-bottom: 8px;
	}
	.cardMeta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		opacity: 0.7;
	}
	.cardMeta code {
		background: rgba(0, 0, 0, 0.35);
		padding: 2px 6px;
		border-radius: 6px;
	}
	.pill {
		padding: 2px 8px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 11px;
	}

	.status {
		margin-top: 10px;
		font-size: 13px;
		opacity: 0.85;
	}
	.reviewOverlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		z-index: 30;
		border: 0;
		padding: 0;
		cursor: pointer;
	}
	.reviewDialog {
		position: fixed;
		inset: auto 16px 24px;
		max-width: 1060px;
		max-height: calc(100vh - 120px);
		margin: 0 auto;
		left: 0;
		right: 0;
		z-index: 31;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 14px;
		background: #111319;
		padding: 14px;
		display: grid;
		gap: 10px;
	}
	.reviewHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.reviewHeader h2 {
		margin: 0;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.reviewMeta {
		margin: 0;
		font-size: 13px;
		opacity: 0.9;
	}
	.diffList {
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 10px;
		padding: 10px;
		display: grid;
		gap: 8px;
		background: rgba(255, 255, 255, 0.02);
		max-height: min(56vh, 520px);
		overflow: auto;
	}
	.diffRow {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		padding: 8px;
		display: grid;
		gap: 4px;
	}
	.diffPath {
		font-family: monospace;
		font-size: 12px;
		opacity: 0.95;
	}
	.diffType {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}
	.diffBefore,
	.diffAfter {
		font-size: 12px;
		word-break: break-word;
	}
	.diffBefore span,
	.diffAfter span {
		opacity: 0.7;
		margin-right: 6px;
	}
	.overflowNote,
	.emptyDiff {
		margin: 0;
		font-size: 12px;
		opacity: 0.8;
	}
	.reviewActions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: flex-end;
	}
	.publishAction {
		border-color: rgba(255, 199, 0, 0.6);
		background: linear-gradient(180deg, rgba(255, 199, 0, 0.32), rgba(255, 199, 0, 0.12));
		color: #fff5c1;
	}
	.iconBtn {
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		border-radius: 8px;
		width: 32px;
		height: 32px;
		cursor: pointer;
	}

	@media (max-width: 640px) {
		.logo img {
			width: 100px;
		}
		.pageTitle {
			font-size: 18px;
		}
		.branchBadge {
			font-size: 11px;
			padding: 5px 8px;
		}
	}
</style>
