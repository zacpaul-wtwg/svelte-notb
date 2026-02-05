<script>
	import { cmsSections } from '$lib/cms/adminSchema';
	import {
		clearDraftStorage,
		loadDraftFromStorage,
		loadPasswordFromSession,
		saveDraftToStorage,
		savePasswordToSession
	} from '$lib/cms/adminDraft';
	import { onMount } from 'svelte';

	let password = '';
	let status = '';
	let busy = false;
	let unlocked = false;
	let allData = null;

	const isLocalDev =
		typeof window !== 'undefined' &&
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

	onMount(async () => {
		password = loadPasswordFromSession();

		const draft = loadDraftFromStorage();
		if (draft) {
			allData = draft;
			unlocked = true;
			status = isLocalDev ? 'Draft loaded (local).' : 'Draft loaded.';
			return;
		}

		// Local feedback loop: auto-load from disk (no password) and allow saving back to disk.
		if (isLocalDev) {
			await reloadFromDisk();
			unlocked = true;
		}
	});

	async function reloadFromDisk() {
		status = '';
		busy = true;
		try {
			const res = await fetch('/cms.json', { cache: 'no-store' });
			const text = await res.text();
			allData = JSON.parse(text);
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
				body: JSON.stringify({ password })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				return;
			}

			allData = JSON.parse(String(data?.content || '{}'));
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

	function resetDraft() {
		clearDraftStorage();
		allData = null;
		unlocked = false;
		status = 'Draft cleared.';
	}
</script>

<svelte:head>
	<title>CMS Admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="wrap">
	<header class="adminTop">
		<div class="adminCenter">
			<a class="logo" href="/">
				<img src="/logo_large.png" alt="North of the Border Logo" />
			</a>
			<h1 class="pageTitle">CMS Admin</h1>
		</div>
	</header>

	<section class="panel">
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
		padding: 78px 16px 24px;
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
		padding: 8px 12px;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(8, 8, 11, 0.92);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(10px);
	}
	.adminCenter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}
	.logo img {
		width: 110px;
		height: auto;
		display: block;
	}
	.pageTitle {
		margin: 0;
		letter-spacing: 0.02em;
		font-size: 14px;
		opacity: 0.85;
		font-weight: 500;
	}

	.panel {
		max-width: 1000px;
		margin: 12px auto 0;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 14px;
		background: rgba(255, 255, 255, 0.04);
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
	@media (max-width: 640px) {
		.logo img {
			width: 96px;
		}
		.pageTitle {
			font-size: 13px;
		}
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
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 12px 12px 10px;
		background: rgba(0, 0, 0, 0.16);
		text-decoration: none;
		color: inherit;
	}
	.card:hover {
		border-color: rgba(255, 199, 0, 0.35);
		background: rgba(0, 0, 0, 0.22);
	}
	.cardTitle {
		font-size: 15px;
		margin-bottom: 8px;
	}
	.cardMeta {
		display: flex;
		gap: 10px;
		align-items: center;
		opacity: 0.85;
		font-size: 12px;
	}
	.pill {
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 999px;
		padding: 2px 8px;
	}

	.status {
		margin: 10px 2px 2px;
		opacity: 0.9;
		font-size: 13px;
	}
	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
	}
</style>
