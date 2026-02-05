<script context="module">
	import { cmsSectionByKey as cmsSectionByKeyModule } from '$lib/cms/adminSchema';

	export async function load({ params }) {
		const section = params.section;
		if (!cmsSectionByKeyModule[section]) {
			return { status: 404 };
		}
		return {
			props: {
				section
			}
		};
	}
</script>

<script>
	import { cmsSectionByKey } from '$lib/cms/adminSchema';
	import {
		loadDraftFromStorage,
		loadPasswordFromSession,
		saveDraftToStorage,
		savePasswordToSession
	} from '$lib/cms/adminDraft';
	import { onMount, tick } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let section;

	const schema = cmsSectionByKey[section];
	const isLocalDev =
		typeof window !== 'undefined' &&
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

	let allData = null;
	let password = '';
	let message = '';
	let status = '';
	let busy = false;
	let showNewsBodyPreview = false;
	let newsBodyEl;
	let newsBodyValue = '';
	let newsBodyDirty = false;

	onMount(() => {
		allData = loadDraftFromStorage();
		password = loadPasswordFromSession();
		message = `Update cms.json (${new Date().toISOString().slice(0, 10)})`;
		if (!allData) {
			status = 'No draft loaded. Go back and unlock/load first.';
		} else if (section === 'newsPosts') {
			newsBodyValue = String(getSectionData()?.body ?? '');
		}
	});

	function getSectionData() {
		if (!allData) return null;
		return allData[section];
	}

	function setSectionData(next) {
		allData = { ...allData, [section]: next };
		saveDraftToStorage(allData);
	}

	function updateObjectField(fieldKey, nextValue) {
		const next = { ...(getSectionData() || {}), [fieldKey]: nextValue };
		setSectionData(next);
	}

	$: if (section === 'newsPosts' && allData && !newsBodyDirty) {
		newsBodyValue = String(getSectionData()?.body ?? '');
	}

	function applyToNewsBody(transform) {
		if (!newsBodyEl) return;
		const current = String(newsBodyValue ?? '');
		const start = newsBodyEl.selectionStart ?? 0;
		const end = newsBodyEl.selectionEnd ?? 0;

		const out = transform({ value: current, start, end });
		if (!out || typeof out.value !== 'string') return;

		newsBodyDirty = true;
		newsBodyValue = out.value;
		updateObjectField('body', out.value);

		tick().then(() => {
			try {
				newsBodyEl.focus();
				newsBodyEl.setSelectionRange(out.start ?? 0, out.end ?? 0);
			} catch {
				// ignore
			}
		});
	}

	function wrapSelection({ value, start, end }, prefix, suffix, placeholder) {
		const selected = value.slice(start, end);
		const inner = selected || placeholder;
		const nextValue = value.slice(0, start) + prefix + inner + suffix + value.slice(end);
		const innerStart = start + prefix.length;
		const innerEnd = innerStart + inner.length;
		return { value: nextValue, start: innerStart, end: innerEnd };
	}

	function prefixSelectedLines({ value, start, end }, fnPrefixForLine) {
		const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
		const lineEndRaw = value.indexOf('\n', end);
		const lineEnd = lineEndRaw === -1 ? value.length : lineEndRaw;
		const block = value.slice(lineStart, lineEnd);
		const lines = block.split('\n');

		const nextBlock = lines
			.map((line, idx) => {
				const p = fnPrefixForLine(idx);
				return line.startsWith(p) ? line : p + line;
			})
			.join('\n');

		const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
		return { value: nextValue, start: lineStart, end: lineStart + nextBlock.length };
	}

	function ensureItem(obj, field) {
		if (obj[field.key] !== undefined) return;
		if (field.widget === 'boolean') obj[field.key] = false;
		else if (field.widget === 'number') obj[field.key] = 0;
		else obj[field.key] = '';
	}

	function addListItem() {
		const current = getSectionData();
		const next = Array.isArray(current) ? [...current] : [];
		const blank = {};
		for (const f of schema.fields) ensureItem(blank, f);
		next.push(blank);
		setSectionData(next);
	}

	function removeListItem(idx) {
		const current = getSectionData();
		if (!Array.isArray(current)) return;
		const next = current.filter((_, i) => i !== idx);
		setSectionData(next);
	}

	function moveListItem(idx, dir) {
		const current = getSectionData();
		if (!Array.isArray(current)) return;
		const next = [...current];
		const swapWith = idx + dir;
		if (swapWith < 0 || swapWith >= next.length) return;
		const tmp = next[idx];
		next[idx] = next[swapWith];
		next[swapWith] = tmp;
		setSectionData(next);
	}

	async function saveToDiskDev() {
		status = '';
		busy = true;
		try {
			const res = await fetch('/data/updateCms.json', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ allData })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				return;
			}
			status = 'Saved to static/cms.json (local dev).';
		} catch (e) {
			status = `Network error: ${e?.message || e}`;
		} finally {
			busy = false;
		}
	}

	async function publishToGitHub() {
		status = '';
		busy = true;
		try {
			if (!password) {
				status = 'Missing password.';
				return;
			}
			savePasswordToSession(password);

			const content = JSON.stringify(allData, null, 2) + '\n';
			const res = await fetch('/.netlify/functions/update-cms-json', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password, message, content })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				return;
			}
			status = `Published. Commit: ${data?.commit || '(unknown)'}`;
		} catch (e) {
			status = `Network error: ${e?.message || e}`;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>CMS Admin · {schema?.label || section}</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="wrap">
	<header class="header">
		<div class="top">
			<a class="btn" href="/cms-admin">← Sections</a>
			<div class="title">
				<h1>{schema.label}</h1>
				<div class="meta"><code>{schema.key}</code> <span class="pill">{schema.kind}</span></div>
			</div>
		</div>
	</header>

	<section class="panel">
		{#if !allData}
			<p class="status">{status}</p>
		{:else}
			{#if schema.kind === 'object'}
				{#each schema.fields as field (field.key)}
					{#if section === 'newsPosts' && field.key === 'body'}
						<div class="mdHead">
							<div class="mdTitle">{field.label}</div>
							<div class="mdTools">
								<button
									class="mini"
									type="button"
									on:click={() =>
										applyToNewsBody((sel) => prefixSelectedLines(sel, () => '## '))
									}
								>
									H2
								</button>
								<button
									class="mini"
									type="button"
									on:click={() =>
										applyToNewsBody((sel) => prefixSelectedLines(sel, () => '### '))
									}
								>
									H3
								</button>
								<button
									class="mini"
									type="button"
									on:click={() =>
										applyToNewsBody((sel) => wrapSelection(sel, '**', '**', 'bold text'))
									}
								>
									Bold
								</button>
								<button
									class="mini"
									type="button"
									on:click={() =>
										applyToNewsBody((sel) => wrapSelection(sel, '*', '*', 'italic text'))
									}
								>
									Italic
								</button>
								<button
									class="mini"
									type="button"
									on:click={() =>
										applyToNewsBody((sel) => prefixSelectedLines(sel, () => '- '))
									}
								>
									Bullets
								</button>
								<button
									class="mini"
									type="button"
									on:click={() =>
										applyToNewsBody((sel) =>
											prefixSelectedLines(sel, (i) => `${i + 1}. `)
										)
									}
								>
									Numbered
								</button>
								<button
									class="mini"
									type="button"
									on:click={() =>
										applyToNewsBody((sel) => wrapSelection(sel, '[', '](https://)', 'link text'))
									}
								>
									Link
								</button>
								<button
									class="mini"
									type="button"
									on:click={() => (showNewsBodyPreview = !showNewsBodyPreview)}
								>
									{showNewsBodyPreview ? 'Edit' : 'Preview'}
								</button>
							</div>
						</div>

						{#if showNewsBodyPreview}
							<div class="mdPreview">
								<SvelteMarkdown source={String(getSectionData()?.body ?? '')} />
							</div>
						{:else}
							<textarea
								class="textarea"
								bind:this={newsBodyEl}
								bind:value={newsBodyValue}
								on:input={(e) => {
									newsBodyDirty = true;
									updateObjectField('body', e.target.value);
								}}
								spellcheck="true"
							/>
						{/if}
					{:else if field.widget === 'text'}
						<label class="label">
							<span>{field.label}</span>
							<textarea
								class="textarea"
								on:input={(e) => {
									updateObjectField(field.key, e.target.value);
								}}
							>{getSectionData()?.[field.key] ?? ''}</textarea>
						</label>
					{:else if field.widget === 'boolean'}
						<label class="check">
							<input
								type="checkbox"
								checked={Boolean(getSectionData()[field.key])}
								on:change={(e) => {
									updateObjectField(field.key, e.target.checked);
								}}
							/>
							<span>{field.label}</span>
						</label>
					{:else}
						<label class="label">
							<span>{field.label}</span>
							<input
								class="input"
								type={field.widget === 'number' ? 'number' : 'text'}
								value={getSectionData()?.[field.key] ?? ''}
								on:input={(e) => {
									const raw = e.target.value;
									const v = field.widget === 'number' ? Number(raw) : raw;
									updateObjectField(field.key, v);
								}}
							/>
						</label>
					{/if}
				{/each}
			{:else if schema.kind === 'list'}
				<div class="row">
					<button class="btn" type="button" on:click={addListItem} disabled={busy}>Add Item</button>
				</div>

				{#each (getSectionData() || []) as item, idx (idx)}
					<details class="item" open={idx < 2}>
						<summary>
							<span class="summaryTitle">
								{schema.itemLabelKey && item?.[schema.itemLabelKey]
									? item[schema.itemLabelKey]
									: `Item ${idx + 1}`}
							</span>
							<span class="summaryActions" aria-hidden="true">
								<button
									class="mini"
									type="button"
									on:click|preventDefault|stopPropagation={() => moveListItem(idx, -1)}
								>
									↑
								</button>
								<button
									class="mini"
									type="button"
									on:click|preventDefault|stopPropagation={() => moveListItem(idx, +1)}
								>
									↓
								</button>
								<button
									class="mini danger"
									type="button"
									on:click|preventDefault|stopPropagation={() => removeListItem(idx)}
								>
									Remove
								</button>
							</span>
						</summary>

						<div class="itemBody">
							{#each schema.fields as field (field.key)}
								{#if field.widget === 'text'}
									<label class="label">
										<span>{field.label}</span>
										<textarea
											class="textarea"
											on:input={(e) => {
												const current = getSectionData();
												const next = current.map((x, i) =>
													i === idx ? { ...x, [field.key]: e.target.value } : x
												);
												setSectionData(next);
											}}
										>{item?.[field.key] ?? ''}</textarea>
									</label>
								{:else if field.widget === 'boolean'}
									<label class="check">
										<input
											type="checkbox"
											checked={Boolean(item?.[field.key])}
											on:change={(e) => {
												const current = getSectionData();
												const next = current.map((x, i) =>
													i === idx ? { ...x, [field.key]: e.target.checked } : x
												);
												setSectionData(next);
											}}
										/>
										<span>{field.label}</span>
									</label>
								{:else}
									<label class="label">
										<span>{field.label}</span>
										<input
											class="input"
											type={field.widget === 'number' ? 'number' : 'text'}
											value={item?.[field.key] ?? ''}
											on:input={(e) => {
												const raw = e.target.value;
												const v = field.widget === 'number' ? Number(raw) : raw;
												const current = getSectionData();
												const next = current.map((x, i) => (i === idx ? { ...x, [field.key]: v } : x));
												setSectionData(next);
											}}
										/>
									</label>
								{/if}
							{/each}
						</div>
					</details>
				{/each}
			{/if}

			<div class="actions">
				{#if isLocalDev}
					<button class="btn primary" type="button" on:click={saveToDiskDev} disabled={busy}>
						{busy ? 'Saving…' : 'Save To Disk (Dev)'}
					</button>
				{:else}
					<label class="label inline">
						<span>Password</span>
						<input class="input" type="password" bind:value={password} autocomplete="current-password" />
					</label>
					<label class="label inline">
						<span>Commit Message</span>
						<input class="input" type="text" bind:value={message} />
					</label>
					<button class="btn primary" type="button" on:click={publishToGitHub} disabled={busy || !password}>
						{busy ? 'Publishing…' : 'Publish'}
					</button>
				{/if}
			</div>

			{#if status}
				<p class="status">{status}</p>
			{/if}
		{/if}
	</section>
</main>

<style>
	.wrap {
		min-height: 100vh;
		padding: 24px 16px;
		background: radial-gradient(900px 500px at 20% 10%, rgba(255, 199, 0, 0.12), transparent 55%),
			radial-gradient(900px 500px at 80% 0%, rgba(0, 184, 255, 0.12), transparent 55%),
			linear-gradient(180deg, #08080b, #0b0b10);
		color: #eef0f6;
	}

	.header {
		max-width: 1000px;
		margin: 0 auto 12px;
	}
	.top {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		flex-wrap: wrap;
	}
	.title h1 {
		margin: 0;
		letter-spacing: 0.02em;
		font-size: 20px;
	}
	.meta {
		margin-top: 4px;
		opacity: 0.85;
		font-size: 12px;
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.pill {
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 999px;
		padding: 2px 8px;
	}

	.panel {
		max-width: 1000px;
		margin: 0 auto;
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
	.label.inline {
		margin: 0;
		min-width: 240px;
		flex: 1 1 240px;
	}
	.label > span {
		font-size: 13px;
		opacity: 0.9;
	}

	.input,
	.textarea {
		width: 100%;
		box-sizing: border-box;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(0, 0, 0, 0.22);
		color: #eef0f6;
		padding: 10px 12px;
		font-size: 14px;
	}

	.textarea {
		min-height: 120px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
		line-height: 1.35;
	}

	.check {
		display: flex;
		gap: 10px;
		align-items: center;
		margin: 0 0 12px;
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

	.item {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.16);
		margin: 0 0 12px;
	}
	summary {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.summaryTitle {
		font-size: 14px;
		opacity: 0.95;
	}
	.summaryActions {
		display: inline-flex;
		gap: 6px;
	}
	.mini {
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		padding: 6px 10px;
		cursor: pointer;
		font-size: 12px;
	}
	.mini.danger {
		border-color: rgba(255, 90, 90, 0.35);
	}
	.itemBody {
		margin-top: 12px;
	}

	.mdHead {
		display: flex;
		gap: 10px;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 8px;
		flex-wrap: wrap;
	}
	.mdTitle {
		font-size: 13px;
		opacity: 0.9;
	}
	.mdTools {
		display: inline-flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.mdPreview {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.16);
		margin: 0 0 12px;
	}

	.actions {
		margin-top: 12px;
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		align-items: flex-end;
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
