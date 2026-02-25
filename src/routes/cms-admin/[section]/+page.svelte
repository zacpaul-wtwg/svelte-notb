<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { page } from '$app/stores';
	import { cmsSectionByKey } from '$lib/cms/adminSchema';
	import {
		loadDraftFromStorage,
		loadPasswordFromSession,
		saveDraftToStorage,
		savePasswordToSession
	} from '$lib/cms/adminDraft';
	import QuillEditor from '$lib/components/QuillEditor.svelte';
	import { dndzone } from 'svelte-dnd-action';

	const isLocalDev =
		typeof window !== 'undefined' &&
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

	function localDateStamp(date = new Date()) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function localIsoTimestamp(date = new Date()) {
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		const offsetMinutes = -date.getTimezoneOffset();
		const offsetSign = offsetMinutes >= 0 ? '+' : '-';
		const absOffset = Math.abs(offsetMinutes);
		const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
		const offsetMins = String(absOffset % 60).padStart(2, '0');
		return `${localDateStamp(date)}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
	}

	let allData = null;
	let status = '';
	let busy = false;
	let password = '';
	let message = '';
	let errorKeys = [];
	let faqOpenIndex = -1;
	let faqPlaceholderIndex = null;
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
		if (/^[a-f0-9]{20,}$/i.test(prefix)) return '';
		return prefix;
	}

	$: sectionKey = $page.params.section;
	$: schema = cmsSectionByKey[sectionKey];
	$: sectionData = allData?.[sectionKey];
	$: if (sectionKey === 'faq' && Array.isArray(sectionData)) {
		const missing = sectionData.some((item) => !item.id);
		if (missing) {
			const next = sectionData.map((item, idx) => ({
				...item,
				id: item.id || `faq_${Date.now()}_${idx}`
			}));
			setSectionData(next);
		}
	}

	const days = [
		{ key: 'sunday', label: 'Sunday' },
		{ key: 'monday', label: 'Monday' },
		{ key: 'tuesday', label: 'Tuesday' },
		{ key: 'wednesday', label: 'Wednesday' },
		{ key: 'thursday', label: 'Thursday' },
		{ key: 'friday', label: 'Friday' },
		{ key: 'saturday', label: 'Saturday' }
	];
	const createDefaultDayHours = () => ({ closed: false, open: '09:00', close: '17:00' });
	const buildDefaultHoursObject = () =>
		Object.fromEntries(days.map((day) => [day.key, createDefaultDayHours()]));

	onMount(async () => {
		password = loadPasswordFromSession();
		message = `Update cms.json (${localDateStamp()})`;
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
			return;
		}
		if (isLocalDev) {
			await reloadFromDisk();
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

	function getSectionData() {
		if (!allData || !schema) return null;
		return allData[sectionKey];
	}

	function setSectionData(next) {
		allData = { ...allData, [sectionKey]: next };
		saveDraftToStorage(allData);
	}

	function updateObjectField(field, value) {
		const next = { ...(getSectionData() || {}), [field]: value };
		if (getSectionData()?.[field] === value) return;
		setSectionData(next);
	}

	function updateHoursField(dayKey, patch) {
		const current = getSectionData() || {};
		const day = current[dayKey] || { closed: false, open: '', close: '' };
		const nextDay = { ...day, ...patch };
		setSectionData({ ...current, [dayKey]: nextDay });
	}

	function toggleDayClosed(dayKey) {
		const current = getSectionData() || {};
		const day = current[dayKey] || { closed: false, open: '', close: '' };
		const closing = !day.closed;
		if (closing) {
			updateHoursField(dayKey, { closed: true, open: '', close: '' });
		} else {
			const fallback = { open: day.open || '09:00', close: day.close || '17:00' };
			updateHoursField(dayKey, { closed: false, ...fallback });
		}
	}

	function addRegularRange() {
		addListItem({
			title: '',
			startDate: '',
			endDate: '',
			hours: buildDefaultHoursObject()
		});
	}

	function updateRegularRangeHours(rangeIdx, dayKey, patch) {
		const ranges = ensureArray(getSectionData());
		const range = ranges[rangeIdx];
		if (!range) return;
		const currentHours = range.hours || {};
		const day = currentHours[dayKey] || createDefaultDayHours();
		const nextDay = { ...day, ...patch };
		updateListItem(rangeIdx, { hours: { ...currentHours, [dayKey]: nextDay } });
	}

	function toggleRegularRangeDayClosed(rangeIdx, dayKey) {
		const ranges = ensureArray(getSectionData());
		const range = ranges[rangeIdx];
		if (!range) return;
		const currentHours = range.hours || {};
		const day = currentHours[dayKey] || createDefaultDayHours();
		const closing = !day.closed;
		if (closing) {
			updateRegularRangeHours(rangeIdx, dayKey, { closed: true, open: '', close: '' });
		} else {
			updateRegularRangeHours(rangeIdx, dayKey, {
				closed: false,
				open: day.open || '09:00',
				close: day.close || '17:00'
			});
		}
	}

	function ensureArray(value) {
		return Array.isArray(value) ? value : [];
	}

	function addListItem(blank) {
		const current = ensureArray(getSectionData());
		setSectionData([...current, blank]);
	}

	function updateListItem(idx, patch) {
		const current = ensureArray(getSectionData());
		const next = current.map((item, i) => (i === idx ? { ...item, ...patch } : item));
		const same = JSON.stringify(current[idx] || {}) === JSON.stringify(next[idx] || {});
		if (same) return;
		setSectionData(next);
	}

	function removeListItem(idx) {
		const current = ensureArray(getSectionData());
		setSectionData(current.filter((_, i) => i !== idx));
	}

	function addHighlight(idx) {
		const current = ensureArray(getSectionData());
		const item = current[idx] || {};
		const highlights = ensureArray(item.highlights);
		const next = current.map((x, i) =>
			i === idx ? { ...item, highlights: [...highlights, ''] } : x
		);
		setSectionData(next);
	}

	function updateHighlight(idx, hIdx, value) {
		const current = ensureArray(getSectionData());
		const item = current[idx] || {};
		const highlights = ensureArray(item.highlights);
		const nextHighlights = highlights.map((h, i) => (i === hIdx ? value : h));
		const next = current.map((x, i) =>
			i === idx ? { ...item, highlights: nextHighlights } : x
		);
		setSectionData(next);
	}

	function removeHighlight(idx, hIdx) {
		const current = ensureArray(getSectionData());
		const item = current[idx] || {};
		const highlights = ensureArray(item.highlights);
		const nextHighlights = highlights.filter((_, i) => i !== hIdx);
		const next = current.map((x, i) =>
			i === idx ? { ...item, highlights: nextHighlights } : x
		);
		setSectionData(next);
	}

	function handleFaqDnd(event) {
		faqOpenIndex = -1;
		if (typeof event?.detail?.overIndex === 'number') {
			faqPlaceholderIndex = event.detail.overIndex;
		}
		setSectionData(event.detail.items);
	}

	function addSpecialEvent() {
		addListItem({ title: 'Title Required', days: [] });
	}

	function addSpecialDay(eventIdx) {
		const current = ensureArray(getSectionData());
		const event = current[eventIdx] || { title: 'Title Required', days: [] };
		const daysList = ensureArray(event.days);
		const nextDays = [
			...daysList,
			{ date: '', open: '', close: '', closed: false }
		];
		const next = current.map((item, i) =>
			i === eventIdx ? { ...event, days: nextDays } : item
		);
		setSectionData(next);
	}

	function updateSpecialDay(eventIdx, dayIdx, patch) {
		const current = ensureArray(getSectionData());
		const event = current[eventIdx];
		if (!event) return;
		const daysList = ensureArray(event.days);
		const nextDays = daysList.map((d, i) => (i === dayIdx ? { ...d, ...patch } : d));
		const next = current.map((item, i) =>
			i === eventIdx ? { ...item, days: nextDays } : item
		);
		setSectionData(next);
	}

	function removeSpecialDay(eventIdx, dayIdx) {
		const current = ensureArray(getSectionData());
		const event = current[eventIdx];
		if (!event) return;
		const daysList = ensureArray(event.days);
		const nextDays = daysList.filter((_, i) => i !== dayIdx);
		const next = current.map((item, i) =>
			i === eventIdx ? { ...item, days: nextDays } : item
		);
		setSectionData(next);
	}

	function toggleSpecialDayClosed(eventIdx, dayIdx) {
		const current = ensureArray(getSectionData());
		const event = current[eventIdx];
		if (!event) return;
		const day = (event.days || [])[dayIdx] || { closed: false, open: '', close: '' };
		const closing = !day.closed;
		updateSpecialDay(eventIdx, dayIdx, {
			closed: closing,
			open: closing ? '' : day.open,
			close: closing ? '' : day.close
		});
	}

	function stampNewsDate() {
		if (sectionKey !== 'newsPosts') return;
		updateObjectField('date', localIsoTimestamp());
	}

	function isTimeOrderValid(open, close) {
		if (!open || !close) return false;
		return open < close;
	}

	function validateHoursPayload() {
		const errors = [];
		const keys = [];
		if (sectionKey === 'hours') {
			const data = getSectionData() || {};
			for (const day of days) {
				const entry = data[day.key];
				if (!entry || entry.closed) continue;
				if (!isTimeOrderValid(entry.open, entry.close)) {
					errors.push(`${day.label}: open time must be before close time`);
					keys.push(`hours:${day.key}`);
				}
			}
		}
		if (sectionKey === 'specialHours') {
			const events = ensureArray(getSectionData());
			events.forEach((event, eventIdx) => {
				ensureArray(event.days).forEach((day, dayIdx) => {
					if (day.closed) return;
					if (!isTimeOrderValid(day.open, day.close)) {
						errors.push(
							`${event.title || `Event ${eventIdx + 1}`}, Day ${dayIdx + 1}: open time must be before close time`
						);
						keys.push(`special:${eventIdx}:${dayIdx}`);
					}
				});
			});
		}
		if (sectionKey === 'regularHoursRanges') {
			const ranges = ensureArray(getSectionData());
			ranges.forEach((range, rangeIdx) => {
				const startDate = String(range?.startDate || '');
				const endDate = String(range?.endDate || '');
				if (!startDate || !endDate) {
					errors.push(`Range ${rangeIdx + 1}: start and end dates are required`);
					keys.push(`regular:${rangeIdx}:range`);
				} else if (startDate > endDate) {
					errors.push(`Range ${rangeIdx + 1}: start date must be before or equal to end date`);
					keys.push(`regular:${rangeIdx}:range`);
				}
				for (const day of days) {
					const entry = range?.hours?.[day.key];
					if (!entry || entry.closed) continue;
					if (!isTimeOrderValid(entry.open, entry.close)) {
						errors.push(
							`Range ${rangeIdx + 1} (${day.label}): open time must be before close time`
						);
						keys.push(`regular:${rangeIdx}:${day.key}`);
					}
				}
			});
		}
		if (sectionKey === 'pickupSettings') {
			const settings = getSectionData() || {};
			const parsed = Number(settings.maxDaysOut);
			if (!Number.isFinite(parsed) || parsed < 1 || parsed > 365) {
				errors.push('Max pickup days out must be between 1 and 365');
				keys.push('pickup:maxDaysOut');
			}
		}
		errorKeys = keys;
		return errors;
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

</script>

<svelte:head>
	<title>CMS Admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="wrap">
	<header class="adminTop">
		<div class="adminLeft">
			<a class="navBtn ghost" href="/cms-admin">Sections</a>
			<span class="editingHint">Changes are stored in draft automatically.</span>
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
		<h1 class="pageTitle">{schema?.label || 'Section'}</h1>
		{#if !isLocalDev}
			<label class="field inlineField">
				<span>Password</span>
				<input
					type="password"
					bind:value={password}
					autocomplete="current-password"
					on:input={(e) => savePasswordToSession(e.target.value)}
				/>
			</label>
		{/if}

		{#if !allData}
			<p class="status">No draft loaded. Go back and unlock first.</p>
			{#if isLocalDev}
				<button class="btn" type="button" on:click={reloadFromDisk} disabled={busy}>
					{busy ? 'Loading…' : 'Reload From Disk'}
				</button>
			{/if}
		{:else}
			{#if sectionKey === 'hours'}
				<div class="stack">
					{#each days as day}
						<div class="card" class:error={errorKeys.includes(`hours:${day.key}`)}>
							<div class="cardHeader rowBetween">
								<span class="dayLabel">{day.label}</span>
								<div class="toggleWrap">
									<button
										class:toggleOn={sectionData?.[day.key]?.closed}
										class="toggle"
										type="button"
										aria-label={`Toggle closed for ${day.label}`}
										on:click={() => toggleDayClosed(day.key)}
									>
										<span></span>
									</button>
									<span class="toggleLabel">Closed</span>
								</div>
							</div>
							{#if !sectionData?.[day.key]?.closed}
								<div class="cardBody" transition:slide>
									<div class="timeInputs inlineTimes">
										<input
											type="time"
											value={sectionData?.[day.key]?.open || ''}
											disabled={sectionData?.[day.key]?.closed}
											on:input={(e) => updateHoursField(day.key, { open: e.target.value })}
										/>
										<input
											type="time"
											value={sectionData?.[day.key]?.close || ''}
											disabled={sectionData?.[day.key]?.closed}
											on:input={(e) => updateHoursField(day.key, { close: e.target.value })}
										/>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			{#if sectionKey === 'regularHoursRanges'}
				<div class="stack">
					{#each ensureArray(sectionData) as range, rangeIdx}
						<div class="card">
							<div class="cardHeader rowBetween">
								<span>Range {rangeIdx + 1}: {range.title || 'Untitled'}</span>
								<button class="iconBtn" type="button" on:click={() => removeListItem(rangeIdx)}>×</button>
							</div>
							<div class="cardBody">
								<div class="gridTwo">
									<label class="field">
										<span>Range Title</span>
										<input
											type="text"
											value={range.title || ''}
											on:input={(e) => updateListItem(rangeIdx, { title: e.target.value })}
										/>
									</label>
									<div class="row dateRangeRow" class:error={errorKeys.includes(`regular:${rangeIdx}:range`)}>
										<label class="field">
											<span>Start Date</span>
											<input
												type="date"
												value={range.startDate || ''}
												on:input={(e) => updateListItem(rangeIdx, { startDate: e.target.value })}
											/>
										</label>
										<label class="field">
											<span>End Date</span>
											<input
												type="date"
												value={range.endDate || ''}
												on:input={(e) => updateListItem(rangeIdx, { endDate: e.target.value })}
											/>
										</label>
									</div>
								</div>

								<div class="stack">
									{#each days as day}
										<div class="card" class:error={errorKeys.includes(`regular:${rangeIdx}:${day.key}`)}>
											<div class="cardHeader rowBetween">
												<span class="dayLabel">{day.label}</span>
												<div class="toggleWrap">
													<button
														class:toggleOn={range?.hours?.[day.key]?.closed}
														class="toggle"
														type="button"
														aria-label={`Toggle closed for ${day.label}`}
														on:click={() => toggleRegularRangeDayClosed(rangeIdx, day.key)}
													>
														<span></span>
													</button>
													<span class="toggleLabel">Closed</span>
												</div>
											</div>
											{#if !range?.hours?.[day.key]?.closed}
												<div class="cardBody" transition:slide>
													<div class="timeInputs inlineTimes">
														<input
															type="time"
															value={range?.hours?.[day.key]?.open || ''}
															on:input={(e) =>
																updateRegularRangeHours(rangeIdx, day.key, { open: e.target.value })}
														/>
														<input
															type="time"
															value={range?.hours?.[day.key]?.close || ''}
															on:input={(e) =>
																updateRegularRangeHours(rangeIdx, day.key, { close: e.target.value })}
														/>
													</div>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/each}
					<button class="btn primary" type="button" on:click={addRegularRange}>
						Add Regular Hours Range
					</button>
				</div>
			{/if}

			{#if sectionKey === 'pickupSettings'}
				<div class="card">
					<div class="cardHeader">Pickup Settings</div>
					<div class="cardBody">
						<label class="field" class:error={errorKeys.includes('pickup:maxDaysOut')}>
							<span>Max Pickup Days Out</span>
							<input
								type="number"
								min="1"
								max="365"
								step="1"
								value={sectionData?.maxDaysOut ?? 30}
								on:input={(e) => updateObjectField('maxDaysOut', e.target.value)}
							/>
						</label>
						<p class="muted">Customers cannot select a pickup date beyond this many days from today.</p>
					</div>
				</div>
			{/if}

			{#if sectionKey === 'specialHours'}
				<div class="stack">
					{#each ensureArray(sectionData) as event, eventIdx}
						<div class="card">
							<div class="cardHeader specialHeader">
								<span class="grab">≡</span>
								<span class="eventLabel">{event.title || 'Title Required'}</span>
									<button
										class="iconBtn"
										type="button"
										aria-label="Remove event"
										on:click={() => removeListItem(eventIdx)}
									>
									×
								</button>
							</div>
							<div class="cardBody">
								<label class="field">
									<span>Event Title</span>
									<input
										type="text"
										value={event.title || ''}
										on:input={(e) => updateListItem(eventIdx, { title: e.target.value || '' })}
									/>
									</label>
									<div class="daysStack">
										{#each ensureArray(event.days) as day, dayIdx}
											<div
												class="dayCard"
												class:error={errorKeys.includes(`special:${eventIdx}:${dayIdx}`)}
												class:closed={day.closed}
											>
												<div class="cardHeader rowBetween dayHeader">
													<input
														class="dayDate"
														type="date"
														value={day.date || ''}
														on:input={(e) => updateSpecialDay(eventIdx, dayIdx, { date: e.target.value })}
													/>
													<div class="dayHeaderActions">
														<div class="toggleWrap">
															<button
																class:toggleOn={day.closed}
																class="toggle"
																type="button"
																aria-label={`Toggle closed for day ${dayIdx + 1}`}
																on:click={() => toggleSpecialDayClosed(eventIdx, dayIdx)}
															>
																<span></span>
															</button>
															<span class="toggleLabel">Closed</span>
														</div>
														<span class="divider" aria-hidden="true"></span>
														<button
															class="iconBtn dayRemove"
															type="button"
															aria-label="Remove day"
															on:click={() => removeSpecialDay(eventIdx, dayIdx)}
														>
															×
														</button>
													</div>
												</div>
												{#if !day.closed}
													<div class="cardBody" transition:slide>
														<div class="timeInputs inlineTimes">
															<input
																type="time"
																value={day.open || ''}
																on:input={(e) =>
																	updateSpecialDay(eventIdx, dayIdx, { open: e.target.value })
																}
															/>
															<input
																type="time"
																value={day.close || ''}
																on:input={(e) =>
																	updateSpecialDay(eventIdx, dayIdx, { close: e.target.value })
																}
															/>
														</div>
													</div>
												{/if}
											</div>
										{/each}
									<button class="btn ghost" type="button" on:click={() => addSpecialDay(eventIdx)}>
										Add Day
									</button>
									</div>
								</div>
							</div>
						{/each}
						<button class="btn primary" type="button" on:click={addSpecialEvent}>
							Add Event
						</button>
					</div>
			{/if}

			{#if sectionKey === 'newsPosts'}
				<div class="card newsCard">
					<div class="cardHeader">News Post</div>
					<div class="cardBody">
						<label class="field">
							<span>Title</span>
							<input
								type="text"
								value={sectionData?.title || ''}
								on:input={(e) => updateObjectField('title', e.target.value)}
							/>
						</label>
						<div class="field">
							<span>Body</span>
							<QuillEditor
								value={sectionData?.body || ''}
								on:change={(e) => updateObjectField('body', e.detail)}
							/>
						</div>
						<p class="muted">Date is set automatically on save.</p>
					</div>
				</div>
			{/if}

			{#if sectionKey === 'pricing'}
				<div class="stack">
					{#each ensureArray(sectionData) as item, idx}
						<div class="card">
							<div class="cardHeader rowBetween">
								<span>Pricing Item {idx + 1}</span>
								<button class="iconBtn" type="button" on:click={() => removeListItem(idx)}>×</button>
							</div>
							<div class="cardBody">
								<label class="field">
									<span>Title</span>
									<input
										type="text"
										value={item.title || ''}
										on:input={(e) => updateListItem(idx, { title: e.target.value })}
									/>
								</label>
								<label class="field">
									<span>Subtitle</span>
									<input
										type="text"
										value={item.subtitle || ''}
										on:input={(e) => updateListItem(idx, { subtitle: e.target.value })}
									/>
								</label>
								<div class="field">
									<span>Highlights</span>
									<div class="listStack">
										{#each ensureArray(item.highlights) as highlight, hIdx}
											<div class="listRow">
												<input
													type="text"
													value={highlight}
													on:input={(e) => updateHighlight(idx, hIdx, e.target.value)}
												/>
												<button
													class="iconBtn"
													type="button"
													aria-label="Remove highlight"
													on:click={() => removeHighlight(idx, hIdx)}
												>
													×
												</button>
											</div>
										{/each}
										<button class="btn ghost" type="button" on:click={() => addHighlight(idx)}>
											Add Highlight
										</button>
									</div>
								</div>
								<label class="field">
									<span>How It Works</span>
									<textarea
										rows="4"
										on:input={(e) => updateListItem(idx, { howItWorks: e.target.value })}
									>{item.howItWorks || ''}</textarea>
								</label>
								<label class="field">
									<span>Best For</span>
									<textarea
										rows="3"
										on:input={(e) => updateListItem(idx, { bestFor: e.target.value })}
									>{item.bestFor || ''}</textarea>
								</label>
							</div>
						</div>
					{/each}
					<button class="btn primary" type="button" on:click={() => addListItem({ title: '', subtitle: '', highlights: [''], howItWorks: '', bestFor: '', order: ensureArray(sectionData).length + 1 })}>
						Add Pricing Item
					</button>
				</div>
			{/if}

			{#if sectionKey === 'faq'}
				<div class="stack">
					<div
						class="faqList"
						use:dndzone={{
							items: ensureArray(sectionData),
							flipDurationMs: 0,
							dropAnimationDurationMs: 0,
							dragHandleSelectors: ['.grab'],
							dropTargetStyle: {},
							centreDraggedOnCursor: false,
							animateDragged: false,
							draggedElClass: 'dragged'
						}}
						on:consider={handleFaqDnd}
						on:finalize={handleFaqDnd}
					>
						{#if faqPlaceholderIndex === 0}
							<div class="faqItem">
								<div class="faqPlaceholder" aria-hidden="true"></div>
							</div>
						{/if}
						{#each ensureArray(sectionData) as item, idx (item.id)}
							<div class="faqItem" animate:flip={{ duration: 320, easing: cubicOut }}>
								<div class="card faqCard">
								<div class="cardHeader rowBetween faqHeader">
									<div class="faqTitle">
										<span class="grab">≡</span>
										<span>Question {idx + 1}: {item.title || 'Untitled'}</span>
									</div>
									<div class="faqActions">
										<button
											class="iconBtn"
											type="button"
											aria-label="Toggle question"
											on:click={() => (faqOpenIndex = faqOpenIndex === idx ? -1 : idx)}
										>
											{faqOpenIndex === idx ? '−' : '+'}
										</button>
										<button
											class="iconBtn"
											type="button"
											aria-label="Remove question"
											on:click={() => removeListItem(idx)}
										>
											×
										</button>
									</div>
								</div>
								{#if faqOpenIndex === idx}
									<div class="cardBody" transition:slide>
										<label class="field">
											<span>Question</span>
											<input
												type="text"
												value={item.title || ''}
												on:input={(e) => updateListItem(idx, { title: e.target.value })}
											/>
										</label>
										<label class="field">
											<span>Answer</span>
											<QuillEditor
												toolbar={[
													['bold', 'italic'],
													[{ list: 'ordered' }, { list: 'bullet' }],
													['link'],
													['clean']
												]}
												value={item.answer || ''}
												on:change={(e) => updateListItem(idx, { answer: e.detail })}
											/>
										</label>
									</div>
								{/if}
								</div>
								{#if faqPlaceholderIndex === idx + 1}
									<div class="faqPlaceholder" aria-hidden="true"></div>
								{/if}
							</div>
						{/each}
					</div>
					<button class="btn primary" type="button" on:click={() => addListItem({ id: `faq_${Date.now()}`, title: '', answer: '' })}>
						Add FAQ
					</button>
					</div>
			{/if}

			{#if sectionKey === 'footerDescription'}
				<div class="card">
					<div class="cardHeader">Footer Description</div>
					<div class="cardBody">
						<label class="field">
							<span>Description (Markdown)</span>
							<textarea
								rows="6"
								on:input={(e) => updateObjectField('body', e.target.value)}
							>{sectionData?.body || ''}</textarea>
						</label>
					</div>
				</div>
			{/if}

			{#if status}
				<p class="status mobileStatus">{status}</p>
			{/if}
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
		text-decoration: none;
	}
	.navBtn.ghost {
		opacity: 0.7;
	}
	.editingHint {
		font-size: 12px;
		opacity: 0.8;
		align-self: center;
	}

	.panel {
		max-width: 1100px;
		margin: 12px auto 0;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 16px;
		background: rgba(255, 255, 255, 0.04);
	}
	.pageTitle {
		margin: 4px 0 12px;
		font-size: 22px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.card {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.05);
		overflow: hidden;
	}
	.card.newsCard {
		overflow: visible;
	}
	.card.error {
		border-color: rgba(255, 90, 90, 0.8);
		box-shadow: 0 0 0 2px rgba(255, 90, 90, 0.3);
	}
	.cardHeader {
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.3);
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		display: flex;
		align-items: center;
		gap: 8px;
		border-radius: 14px 14px 0 0;
	}
	.rowBetween {
		justify-content: space-between;
	}
	.cardBody {
		padding: 14px;
		display: grid;
		gap: 12px;
	}
	.dayCard .cardBody {
		padding-top: 12px;
	}

	.stack {
		display: grid;
		gap: 16px;
	}

	.row {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}
	.gridTwo {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
	.dateRangeRow {
		align-items: flex-end;
	}
	.dayLabel {
		min-width: 110px;
		font-weight: 600;
	}

	.field {
		display: grid;
		gap: 6px;
	}
	.inlineField {
		max-width: 320px;
		margin: 0 0 16px;
	}
	.field > span {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.8;
	}
	.field.error input {
		border-color: rgba(255, 90, 90, 0.8);
		box-shadow: 0 0 0 2px rgba(255, 90, 90, 0.3);
	}
	input,
	textarea {
		width: 100%;
		box-sizing: border-box;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(0, 0, 0, 0.22);
		color: #eef0f6;
		padding: 10px 12px;
		font-size: 14px;
	}
	textarea {
		min-height: 120px;
	}
	.listStack {
		display: grid;
		gap: 10px;
	}
	.listRow {
		gap: 10px;
		align-items: center;
		display: flex;
	}
	.listRow input {
		flex: 1;
	}
	.faqList {
		display: grid;
		gap: 14px;
	}
	.faqItem {
		display: grid;
		gap: 14px;
	}
	.faqPlaceholder {
		border: 2px dotted rgba(255, 255, 255, 0.4);
		border-radius: 14px;
		height: 48px;
	}
	.faqCard {
		transition: transform 0.32s ease;
	}
	:global(.dndPlaceholder),
	:global(.dnd-placeholder),
	:global(.dnd-placeholder-ghost) {
		border: 0;
		background: transparent;
		min-height: 56px;
		position: relative;
	}
	:global(.dndPlaceholder)::before,
	:global(.dnd-placeholder)::before,
	:global(.dnd-placeholder-ghost)::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 44px;
		border: 2px dotted rgba(255, 255, 255, 0.4);
		border-radius: 14px;
	}
	:global(.dndGhost),
	:global(.dnd-ghost) {
		box-shadow: none !important;
	}
	.faqHeader {
		justify-content: space-between;
	}
	.faqTitle {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.faqTitle .grab {
		cursor: grab;
	}
	:global(.dragged) {
		transform-origin: left center;
	}
	.faqList .faqCard {
		transition: transform 0.42s ease;
	}
	.faqActions {
		display: inline-flex;
		gap: 6px;
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
	.btn.ghost {
		background: rgba(255, 255, 255, 0.02);
	}

	.toggleWrap {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.toggleLabel {
		font-size: 12px;
		opacity: 0.8;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.toggle {
		width: 42px;
		height: 22px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
		position: relative;
		cursor: pointer;
		transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.toggle span {
		width: 18px;
		height: 18px;
		border-radius: 999px;
		background: #fff;
		position: absolute;
		top: 1px;
		left: 2px;
		transition: transform 0.2s ease;
	}
	.toggleOn span {
		transform: translateX(20px);
	}
	.toggleOn {
		background: rgba(255, 199, 0, 0.35);
		border-color: rgba(255, 199, 0, 0.7);
		box-shadow: 0 0 0 2px rgba(255, 199, 0, 0.2);
	}

	.timeInputs {
		display: flex;
		gap: 8px;
		flex-wrap: nowrap;
	}
	.inlineTimes {
		justify-content: flex-start;
	}
	.inlineTimes input {
		min-width: 140px;
	}
	@media (max-width: 520px) {
		.timeInputs {
			flex-wrap: wrap;
		}
	}
	@media (max-width: 720px) {
		.dayHeader {
			flex-wrap: wrap;
			gap: 10px;
		}
		.dayHeaderActions {
			width: 100%;
			justify-content: space-between;
			order: 0;
		}
		.dayDate {
			width: 100%;
			order: 1;
		}
		.inlineTimes input {
			min-width: 0;
			flex: 1 1 140px;
		}
	}
	.timeInputs.collapsed {
		display: none;
	}

	input[type='time']::-webkit-calendar-picker-indicator {
		filter: invert(1);
	}
	input[type='date']::-webkit-calendar-picker-indicator,
	input[type='datetime-local']::-webkit-calendar-picker-indicator {
		filter: invert(1);
	}

	.specialHeader {
		justify-content: space-between;
	}
	.grab {
		opacity: 0.6;
	}
	.eventLabel {
		flex: 1;
	}
	.iconBtn {
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(0, 0, 0, 0.25);
		color: #eef0f6;
		border-radius: 8px;
		width: 32px;
		height: 32px;
		cursor: pointer;
	}
	.daysStack {
		display: grid;
		gap: 10px;
	}
	.dayCard {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		overflow: hidden;
		padding: 0 10px 10px;
		display: grid;
		gap: 10px;
	}
	.dayCard.closed {
		padding-bottom: 0;
	}
	.dayHeaderActions {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}
	.dayHeaderActions .divider {
		width: 1px;
		height: 18px;
		background: rgba(255, 255, 255, 0.25);
	}
	.dayDate {
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(0, 0, 0, 0.2);
		color: #eef0f6;
		border-radius: 8px;
		padding: 6px 10px;
		font-size: 12px;
		width: 150px;
	}
	.dayCard .cardHeader {
		margin: 0 -10px;
	}
	.dayCard.error {
		border-color: rgba(255, 90, 90, 0.8);
		box-shadow: 0 0 0 2px rgba(255, 90, 90, 0.3);
	}
	.dayMeta {
		font-size: 12px;
		text-transform: uppercase;
		opacity: 0.7;
	}
	.dayHeader {
		align-items: center;
	}

	.status {
		margin-top: 10px;
		font-size: 13px;
		opacity: 0.85;
	}
	.mobileStatus {
		display: none;
	}

	@media (max-width: 860px) {
		.mobileStatus {
			display: block;
		}
		.branchBadge {
			font-size: 11px;
			padding: 5px 8px;
		}
		.gridTwo {
			grid-template-columns: 1fr;
		}
	}

	.muted {
		font-size: 12px;
		opacity: 0.7;
	}
</style>
