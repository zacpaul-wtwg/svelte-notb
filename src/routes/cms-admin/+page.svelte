<script>
	import { onMount } from 'svelte';
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

	const BRANCH_STORAGE_KEY = 'cms_target_branch';

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
			unlocked = true;
			status = isLocalDev ? 'Draft loaded (local).' : 'Draft loaded.';
			return;
		}

		if (isLocalDev) {
			await reloadFromDisk();
			unlocked = true;
		}
	});

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
				: `Updated. Commit: ${data?.commit || '(unknown)'}`;
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
		status = 'Draft cleared.';
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
				on:click={saveDraft}
				disabled={!allData || busy || publishing}
			>
				{busy ? 'Saving…' : 'Save'}
			</button>
			{#if !isLocalDev}
				<button
					class="navBtn publishBtn"
					type="button"
					on:click={() => saveDraft({ publish: true })}
					disabled={!allData || publishing}
				>
					{publishing ? 'Publishing…' : 'Commit & Go Live'}
				</button>
			{/if}
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
	.navBtn.publishBtn {
		border-color: rgba(255, 199, 0, 0.6);
		background: linear-gradient(180deg, rgba(255, 199, 0, 0.32), rgba(255, 199, 0, 0.12));
		color: #fff5c1;
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
