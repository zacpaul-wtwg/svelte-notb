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
	let closedMap = {};
	let timeMap = {};
	let toggleMap = {};

	onMount(() => {
		allData = loadDraftFromStorage();
		password = loadPasswordFromSession();
		message = `Update cms.json (${new Date().toISOString().slice(0, 10)})`;
		syncClosedMapFromData(getSectionData());
		syncToggleMapFromData(getSectionData());
		if (!allData) {
			status = 'No draft loaded. Go back and unlock/load first.';
			if (isLocalDev) {
				// Local dev: hydrate from /cms.json automatically
				fetch('/cms.json', { cache: 'no-store' })
					.then((res) => res.text())
					.then((text) => {
						allData = JSON.parse(text);
						saveDraftToStorage(allData);
						syncClosedMapFromData(getSectionData());
						syncToggleMapFromData(getSectionData());
						status = 'Loaded from /cms.json';
					})
					.catch((e) => {
						status = `Failed to load /cms.json: ${e?.message || e}`;
					});
			}
		}
	});

	function getSectionData() {
		if (!allData) return null;
		return allData[section];
	}

	function parseStoreHours(value) {
		const trimmed = String(value || '').trim();
		if (!trimmed || isClosedValue(trimmed)) return { start: '', end: '' };
		const match =
			/^(1[0-2]|[1-9])(?::([0-5][0-9]))?\s?(AM|PM)\s?-\s?(1[0-2]|[1-9])(?::([0-5][0-9]))?\s?(AM|PM)$/i.exec(
				trimmed
			);
		if (!match) return { start: '', end: '' };
		const [, h1, m1, ap1, h2, m2, ap2] = match;
		const to24 = (h, m, ap) => {
			let hour = Number(h);
			const min = Number(m || '0');
			const upper = ap.toUpperCase();
			if (upper === 'AM') {
				if (hour === 12) hour = 0;
			} else if (hour !== 12) {
				hour += 12;
			}
			return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
		};
		return { start: to24(h1, m1, ap1), end: to24(h2, m2, ap2) };
	}

	function formatTimeLabel(value) {
		if (!value) return '';
		const [hStr, mStr] = value.split(':');
		const h = Number(hStr);
		const m = Number(mStr || '0');
		const ap = h >= 12 ? 'PM' : 'AM';
		const hour12 = h % 12 === 0 ? 12 : h % 12;
		const minutes = m ? `:${String(m).padStart(2, '0')}` : '';
		return `${hour12}${minutes} ${ap}`;
	}

	function formatStoreHoursFromTimes(start, end) {
		if (!start || !end) return '';
		return `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
	}

	function syncClosedMapFromData(nextSection) {
		if (schema?.key !== 'hours' || !nextSection) return;
		const next = {};
		const nextTimes = {};
		for (const field of schema.fields) {
			if (field.widget === 'storeHours') {
				next[field.key] = isClosedValue(nextSection[field.key]);
				nextTimes[field.key] = parseStoreHours(nextSection[field.key]);
			}
		}
		closedMap = next;
		timeMap = nextTimes;
	}

	function syncToggleMapFromData(nextSection) {
		if (!schema || !nextSection) return;
		const next = {};
		if (schema.kind === 'object') {
			for (const field of schema.fields) {
				if (field.widget === 'boolean') {
					next[field.key] = Boolean(nextSection[field.key]);
				}
			}
		} else if (schema.kind === 'list' && Array.isArray(nextSection)) {
			nextSection.forEach((item, idx) => {
				for (const field of schema.fields) {
					if (field.widget === 'boolean') {
						next[`${idx}:${field.key}`] = Boolean(item?.[field.key]);
					}
				}
			});
		}
		toggleMap = next;
	}

	function setSectionData(next) {
		const normalized = normalizeSpecialHours(next);
		allData = { ...allData, [section]: normalized };
		saveDraftToStorage(allData);
		syncClosedMapFromData(normalized);
		syncToggleMapFromData(normalized);
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

	function isClosedValue(value) {
		return String(value || '').trim().toLowerCase() === 'closed';
	}

	function toggleClosed(fieldKey) {
		const current = getSectionData();
		const closing = !isClosedValue(current?.[fieldKey]);
		closedMap = { ...closedMap, [fieldKey]: closing };
		updateObjectField(fieldKey, closing ? 'Closed' : '');
	}

	function toggleBooleanField(fieldKey) {
		const current = Boolean(getSectionData()?.[fieldKey]);
		toggleMap = { ...toggleMap, [fieldKey]: !current };
		updateObjectField(fieldKey, !current);
	}

	function toggleBooleanListField(idx, fieldKey) {
		const current = getSectionData();
		if (!Array.isArray(current)) return;
		const nextValue = !Boolean(current[idx]?.[fieldKey]);
		toggleMap = { ...toggleMap, [`${idx}:${fieldKey}`]: nextValue };
		const next = current.map((x, i) => (i === idx ? { ...x, [fieldKey]: nextValue } : x));
		setSectionData(next);
	}

	function getListValue(idx, key) {
		const current = getSectionData();
		if (!Array.isArray(current)) return '';
		return current[idx]?.[key] ?? '';
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

	function normalizeSpecialHours(next) {
		if (section !== 'specialHours' || !Array.isArray(next)) return next;
		return next.map((item) => ({
			...item,
			days: Array.isArray(item?.days) ? item.days : []
		}));
	}

	function addListItem() {
		const current = getSectionData();
		const next = Array.isArray(current) ? [...current] : [];
		const blank = {};
		for (const f of schema.fields) ensureItem(blank, f);
		if (section === 'specialHours' && !blank.title) blank.title = 'Title Required';
		if (section === 'specialHours' && !Array.isArray(blank.days)) blank.days = [];
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
	<header class="adminTop">
		<div class="adminBar">
			<div class="adminLeft">
				<a class="btn ghost" href="/cms-admin">← Sections</a>
				{#if isLocalDev}
					<button class="btn primary" type="button" on:click={saveToDiskDev} disabled={busy}>
						{busy ? 'Saving…' : 'Save'}
					</button>
				{:else}
					<button class="btn primary" type="button" on:click={publishToGitHub} disabled={busy || !password}>
						{busy ? 'Publishing…' : 'Save'}
					</button>
				{/if}
			</div>
			<div class="adminCenter">
				<h1 class="pageTitle">{schema.label}</h1>
			</div>
			<a class="logo" href="/">
				<img src="/logo_large.png" alt="North of the Border Logo" />
			</a>
		</div>
	</header>

	<section class="panel">
		{#if !allData}
			<p class="status">{status}</p>
		{:else}
			{#if schema.kind === 'object'}
					{#each schema.fields as field (field.key)}
					{#if section === 'newsPosts' && field.key === 'date'}
						<div class="label">
							<span>{field.label}</span>
							<div class="readonlyField">{getSectionData()?.date || 'Auto-set on save'}</div>
							<small class="hint">Auto-set when you save.</small>
						</div>
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
						<div class="label">
							<div class="hoursHeader">
								<span>{field.label}</span>
								<span class="hoursSep"></span>
								<button
									type="button"
									class="closedToggle"
									class:toggleOn={Boolean(closedMap?.[field.key])}
									aria-pressed={Boolean(closedMap?.[field.key])}
									on:click={() => toggleClosed(field.key)}
								>
									<span class="toggleTrack"><span class="toggleThumb"></span></span>
									<span>Closed</span>
								</button>
							</div>
							<div class="hoursRow">
								<div class="timePickers" data-collapsed={Boolean(closedMap?.[field.key])}>
									<input
										class="input timeInput"
										type="time"
										step="60"
										disabled={Boolean(closedMap?.[field.key])}
										value={timeMap?.[field.key]?.start || ''}
										on:input={(e) => {
											const start = e.target.value;
											const end = timeMap?.[field.key]?.end || '';
											timeMap = { ...timeMap, [field.key]: { start, end } };
											updateObjectField(field.key, formatStoreHoursFromTimes(start, end));
										}}
									/>
									<span class="timeSep">to</span>
									<input
										class="input timeInput"
										type="time"
										step="60"
										disabled={Boolean(closedMap?.[field.key])}
										value={timeMap?.[field.key]?.end || ''}
										on:input={(e) => {
											const end = e.target.value;
											const start = timeMap?.[field.key]?.start || '';
											timeMap = { ...timeMap, [field.key]: { start, end } };
											updateObjectField(field.key, formatStoreHoursFromTimes(start, end));
										}}
									/>
								</div>
							</div>
							{#if Boolean(closedMap?.[field.key])}
								<small class="hint">Closed</small>
							{:else if getSectionData()?.[field.key] && !validateStoreHours(getSectionData()?.[field.key]).ok}
								<small class="hint error">
									{validateStoreHours(getSectionData()?.[field.key]).message}
								</small>
							{:else}
								<small class="hint">Use the time pickers to set <code>10 AM - 2 PM</code>.</small>
							{/if}
						</div>
					{:else if field.widget === 'boolean'}
						<div class="toggleRow">
							<span>{field.label}</span>
							<span class="hoursSep"></span>
							<button
								type="button"
								class="closedToggle"
								class:toggleOn={Boolean(toggleMap?.[field.key])}
								aria-pressed={Boolean(toggleMap?.[field.key])}
								on:click={() => toggleBooleanField(field.key)}
							>
								<span class="toggleTrack"><span class="toggleThumb"></span></span>
								<span>On</span>
							</button>
						</div>
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
					<button
						class="btn"
						type="button"
						on:click={() => {
							addListItem();
						}}
						disabled={busy}
					>
						{section === 'specialHours' ? 'Add Event' : 'Add Item'}
					</button>
				</div>

				{#if section === 'specialHours'}
					{#each (getSectionData() || []) as item, idx (idx)}
						<div class="item alwaysOpen">
							<div class="summaryRow">
								<span class="summaryLeft">
									<span class="summaryHandle" aria-hidden="true">⋮⋮</span>
								<span class="summaryEvent">{getSectionData()?.[idx]?.title || 'Title Required'}</span>
								</span>
								<span class="summaryActions" aria-hidden="true">
									<button class="mini" type="button" on:click={() => moveListItem(idx, -1)}>
										↑
									</button>
									<button class="mini" type="button" on:click={() => moveListItem(idx, +1)}>
										↓
									</button>
									<button class="mini danger" type="button" on:click={() => removeListItem(idx)}>
										<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
											<path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
										</svg>
									</button>
								</span>
							</div>
							<div class="itemBody">
								<label class="label">
									<span>Event Title</span>
									<input
										class="input"
										type="text"
										value={getSectionData()?.[idx]?.title ?? ''}
										placeholder="Title Required"
										on:input={(e) => {
											const current = getSectionData();
											const next = current.map((x, i) =>
												i === idx ? { ...x, title: e.target.value } : x
											);
											setSectionData(next);
										}}
									/>
								</label>
								<div class="dayStack">
									{#each (item?.days ?? []) as day, dayIdx (day?.id || dayIdx)}
										<div class="dayCard">
											<span>Day {dayIdx + 1} placeholder</span>
											<button
												class="mini danger dayRemove"
												type="button"
												on:click={() => {
													const current = getSectionData();
													if (!Array.isArray(current)) return;
													const days = Array.isArray(item?.days) ? [...item.days] : [];
													if (day?.id) {
														const removeIdx = days.findIndex((d) => d?.id === day.id);
														if (removeIdx >= 0) days.splice(removeIdx, 1);
													} else {
														days.splice(dayIdx, 1);
													}
													const next = current.map((x, i) =>
														i === idx ? { ...x, days } : x
													);
													setSectionData(next);
												}}
											>
												<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
													<path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
												</svg>
											</button>
										</div>
									{/each}
									<button
										class="btn ghost"
										type="button"
										on:click={() => {
											const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
											const current = getSectionData();
											if (!Array.isArray(current)) return;
											const days = Array.isArray(item?.days) ? [...item.days] : [];
											days.push({ id, placeholder: true });
											const next = current.map((x, i) => (i === idx ? { ...x, days } : x));
											setSectionData(next);
										}}
									>
										Add Day
									</button>
								</div>
							</div>
						</div>
					{/each}
				{:else}
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
										<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
											<path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
										</svg>
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
									<div class="toggleRow">
										<span>{field.label}</span>
										<span class="hoursSep"></span>
										<button
											type="button"
											class="closedToggle"
											class:toggleOn={Boolean(toggleMap?.[`${idx}:${field.key}`])}
											aria-pressed={Boolean(toggleMap?.[`${idx}:${field.key}`])}
											on:click={() => toggleBooleanListField(idx, field.key)}
										>
											<span class="toggleTrack"><span class="toggleThumb"></span></span>
											<span>On</span>
										</button>
									</div>
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
			{/if}

			{#if !isLocalDev}
				<div class="publish">
					<label class="label inline">
						<span>Password</span>
						<input class="input" type="password" bind:value={password} autocomplete="current-password" />
					</label>
					<label class="label inline">
						<span>Commit Message</span>
						<input class="input" type="text" bind:value={message} />
					</label>
				</div>
			{/if}

			{#if status}
				<p class="status">{status}</p>
			{/if}
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
		background: rgba(8, 8, 11, 0.92);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(10px);
	}
	.adminBar {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.adminLeft {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.adminCenter {
		display: flex;
		justify-content: center;
		flex: 1 1 auto;
	}
	.logo img {
		width: 120px;
		height: auto;
		display: block;
	}
	.pageTitle {
		margin: 0;
		letter-spacing: 0.02em;
		font-size: 18px;
		opacity: 0.85;
		font-weight: 500;
	}
	.adminTop + .panel {
		margin-top: 10px;
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
	.readonlyField {
		width: 100%;
		box-sizing: border-box;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(0, 0, 0, 0.18);
		color: rgba(238, 240, 246, 0.75);
		padding: 10px 12px;
		font-size: 14px;
	}

	.textarea {
		min-height: 120px;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
		line-height: 1.35;
	}
	.hoursEditable[contenteditable='false'] {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.check {
		display: flex;
		gap: 10px;
		align-items: center;
		margin: 0 0 12px;
	}
	.toggleRow {
		display: flex;
		align-items: center;
		gap: 10px;
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
	.summaryRow {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 10px;
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
	.summaryHandle {
		font-size: 16px;
		letter-spacing: 2px;
		opacity: 0.6;
		cursor: grab;
	}
	.summaryLeft {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		flex: 1 1 auto;
		min-width: 0;
	}
	.summaryEvent {
		font-size: 12px;
		opacity: 0.7;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.dayStack {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.dayCard {
		border: 1px dashed rgba(255, 255, 255, 0.16);
		border-radius: 12px;
		padding: 10px 12px;
		font-size: 13px;
		opacity: 0.95;
		color: #eef0f6;
		background: rgba(0, 0, 0, 0.22);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.dayRemove {
		padding: 4px 8px;
		line-height: 1;
		font-size: 16px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.dayRemove .icon {
		width: 14px;
		height: 14px;
		color: #eef0f6;
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}
	.mini.danger {
		border-color: rgba(255, 90, 90, 0.35);
	}
	.mini .icon {
		width: 14px;
		height: 14px;
		color: #eef0f6;
	}
	.itemBody {
		margin-top: 12px;
	}

	.publish {
		margin-top: 24px;
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		align-items: flex-end;
	}
	.btn.ghost {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: inherit;
	}
	@media (max-width: 640px) {
		.logo img {
			width: 96px;
		}
		.pageTitle {
			font-size: 16px;
		}
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
		pointer-events: none;
	}
	.hoursRow {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}
	.timePickers {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: nowrap;
		transition: max-height 0.2s ease, opacity 0.2s ease;
		max-height: 48px;
	}
	.timePickers[data-collapsed='true'] {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
	}
	.timeInput {
		width: 150px;
	}
	.timeInput::-webkit-calendar-picker-indicator {
		filter: invert(1);
		opacity: 0.9;
	}
	.timeSep {
		font-size: 13px;
		opacity: 0.75;
	}
	@media (max-width: 640px) {
		.timePickers {
			flex-wrap: wrap;
		}
		.timeInput {
			width: min(100%, 180px);
		}
	}
	.closedToggle {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		font-size: 13px;
		opacity: 0.9;
		background: transparent;
		border: 0;
		color: inherit;
		cursor: pointer;
		padding: 0;
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
		cursor: pointer;
	}
	.toggleThumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #eef0f6;
		transform: translateX(0);
		transition: transform 0.2s ease;
	}
	.closedToggle {
		cursor: pointer;
		user-select: none;
	}
	.closedToggle.toggleOn .toggleTrack {
		background: rgba(255, 199, 0, 0.35);
		border-color: rgba(255, 199, 0, 0.55);
	}
	.closedToggle.toggleOn .toggleTrack .toggleThumb {
		transform: translateX(16px);
	}
	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
	}
</style>
