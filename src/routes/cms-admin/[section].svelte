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
	import { onMount } from 'svelte';
	import QuillEditor from '$lib/components/QuillEditor.svelte';

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

	onMount(() => {
		allData = loadDraftFromStorage();
		password = loadPasswordFromSession();
		message = `Update cms.json (${new Date().toISOString().slice(0, 10)})`;
		if (!allData) {
			status = 'No draft loaded. Go back and unlock/load first.';
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

	function validateStoreHours(value) {
		const trimmed = String(value || '').trim();
		if (!trimmed) return { ok: false, message: 'Required' };
		const re =
			/^(1[0-2]|[1-9])(?::[0-5][0-9])?\s?(AM|PM)\s?-\s?(1[0-2]|[1-9])(?::[0-5][0-9])?\s?(AM|PM)$/i;
		if (!re.test(trimmed)) {
			return { ok: false, message: 'Use format like “10 AM - 2 PM”.' };
		}
		return { ok: true };
	}

	function formatStoreHoursInput(raw) {
		let v = String(raw || '');
		if (!v) return '';
		v = v.toUpperCase();
		// Keep only digits, A/P/M, colon, dash, space
		v = v.replace(/[^0-9APM:\-\s]/g, '');
		// Drop stray single-letter A/P tokens (avoid "A - P" partials)
		v = v.replace(/\bA\b/g, '').replace(/\bP\b/g, '');
		v = v.replace(/\s*-\s*/g, ' - ');
		v = v.replace(/(\d)(AM|PM)/g, '$1 $2');
		// Don't try to auto-space lone A/P (we removed them above)
		v = v.replace(/\s{2,}/g, ' ').trim();
		return v;
	}

	function maybeAutoInsertDash(input) {
		const current = String(input.value || '');
		if (current.includes('-')) return;
		// If the first time range is complete (ends in AM/PM), append " - "
		if (/\b(AM|PM)\s*$/.test(current)) {
			input.value = `${current} - `;
		}
	}

	function isClosedValue(value) {
		return String(value || '').trim().toLowerCase() === 'closed';
	}

	function formatNewsDateTime(value) {
		const d = value ? new Date(value) : null;
		if (!d || Number.isNaN(d.getTime())) return '';
		const day = d.getDate();
		const ordinal =
			day % 10 === 1 && day % 100 !== 11
				? 'st'
				: day % 10 === 2 && day % 100 !== 12
					? 'nd'
					: day % 10 === 3 && day % 100 !== 13
						? 'rd'
						: 'th';
		const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
		const month = d.toLocaleDateString('en-US', { month: 'long' });
		const time = d.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit'
		});
		return `${weekday}, ${month} ${day}${ordinal}, ${d.getFullYear()} ${time}`;
	}

	function setNewsDateToNow() {
		updateObjectField('date', formatNewsDateTime(new Date()));
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
			if (section === 'newsPosts') {
				setNewsDateToNow();
			}
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
			if (section === 'newsPosts') {
				setNewsDateToNow();
			}

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
					{#if section === 'newsPosts' && field.key === 'date'}
						<label class="label">
							<span>{field.label}</span>
							<input class="input" type="text" value={getSectionData()?.date || ''} readonly />
							<small class="hint">Auto-set when you save.</small>
						</label>
					{:else if section === 'newsPosts' && field.key === 'body'}
						<div class="label">
							<span>{field.label}</span>
							<QuillEditor
								value={String(getSectionData()?.body ?? '')}
								placeholder="Write the news update..."
								on:change={(e) => updateObjectField('body', e.detail)}
							/>
						</div>
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
					{:else if field.widget === 'storeHours'}
						<label class="label">
							<div class="hoursHeader">
								<span>{field.label}</span>
								<span class="hoursSep"></span>
								<label class="closedToggle">
									<input
										class="toggleInput"
										type="checkbox"
										checked={isClosedValue(getSectionData()?.[field.key])}
										on:change={(e) => {
											if (e.target.checked) {
												updateObjectField(field.key, 'Closed');
											} else {
												updateObjectField(field.key, '');
											}
										}}
									/>
									<span class="toggleTrack"><span class="toggleThumb"></span></span>
									<span>Closed</span>
								</label>
							</div>
							<div class="hoursRow">
								<input
									class="input"
									type="text"
									data-field-key={field.key}
									value={getSectionData()?.[field.key] ?? ''}
									disabled={isClosedValue(getSectionData()?.[field.key])}
									on:input={(e) => {
										const next = formatStoreHoursInput(e.target.value);
										e.target.value = next;
										maybeAutoInsertDash(e.target);
										updateObjectField(field.key, next);
									}}
								/>
							</div>
							{#if !validateStoreHours(getSectionData()?.[field.key]).ok}
								<small class="hint error">
									{validateStoreHours(getSectionData()?.[field.key]).message}
								</small>
							{:else}
								<small class="hint">Format: <code>10 AM - 2 PM</code></small>
							{/if}
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

	.actions {
		position: sticky;
		bottom: 0;
		padding: 10px 0 0;
		background: linear-gradient(180deg, rgba(11, 11, 16, 0) 0%, rgba(11, 11, 16, 0.9) 30%);
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
	.hint {
		font-size: 12px;
		opacity: 0.75;
	}
	.hint.error {
		color: #ff9d9d;
		opacity: 1;
	}
	.hoursHeader {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.hoursSep {
		flex: 1;
		height: 1px;
		background: rgba(255, 255, 255, 0.15);
	}
	.hoursRow {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}
	.closedToggle {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		font-size: 13px;
		opacity: 0.9;
	}
	.toggleInput {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.toggleTrack {
		width: 40px;
		height: 22px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.2);
		display: inline-flex;
		align-items: center;
		padding: 2px;
		box-sizing: border-box;
		transition: background 0.2s ease, border-color 0.2s ease;
	}
	.toggleThumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #eef0f6;
		transform: translateX(0);
		transition: transform 0.2s ease;
	}
	.toggleInput:checked + .toggleTrack {
		background: rgba(255, 199, 0, 0.35);
		border-color: rgba(255, 199, 0, 0.55);
	}
	.toggleInput:checked + .toggleTrack .toggleThumb {
		transform: translateX(16px);
	}
	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
	}
</style>
