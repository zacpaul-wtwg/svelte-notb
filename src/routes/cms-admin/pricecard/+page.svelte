<script>
	import { onDestroy, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { loadPasswordFromSession, savePasswordToSession } from '$lib/cms/adminDraft';

	let password = '';
	let status = '';
	let loadingList = false;
	let loadingProduct = false;
	let unlocked = false;
	let search = '';
	let items = [];
	let selectedId = null;
	let product = null;
	let oversetWarnings = [];
	let previewNote = 'No warnings.';
	let shrinkTitleForOverset = true;
	let autoFitDescription = true;
	let autoFitSpecs = true;
	let descBaseLevel = 0;
	let specBaseLevel = 0;
	let titleShrinkApplied = false;
	let titleSubApplied = false;
	let titleShrinkSelectionId = null;
	let normalizedTitle = '';
	let titleMain = '';
	let titleSub = '';
	let descFitLevel = 0;
	let specFitLevel = 0;
	let storedItemSettings = {};
	let cardCanvasEl;
	let leftBoxEl;
	let titleEl;
	let titleMainEl;
	let titleSubEl;
	let descEl;
	let rightColumnEl;
	let infoPanelEl;
	let resizeObserver;
	let oversetFrame = 0;

	const BRANCH_STORAGE_KEY = 'cms_target_branch';
	const ITEM_SETTINGS_KEY = 'notb.priceCardToolItemSettings.v1';
	const DESC_BASE_FONT_SIZE = 13;
	const DESC_MIN_FONT_SIZE = 9;
	const DESC_STEP = 0.5;
	const MAX_DESC_SIZE_LEVEL = Math.round((DESC_BASE_FONT_SIZE - DESC_MIN_FONT_SIZE) / DESC_STEP);
	const SPEC_BASE_FONT_SIZE = 12;
	const SPEC_MIN_FONT_SIZE = 8;
	const SPEC_STEP = 0.5;
	const MAX_SPEC_SIZE_LEVEL = Math.round((SPEC_BASE_FONT_SIZE - SPEC_MIN_FONT_SIZE) / SPEC_STEP);

	const isLocalDev =
		typeof window !== 'undefined' &&
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

	const inferBranchFromHost = () => {
		if (typeof window === 'undefined') return '';
		const params = new URLSearchParams(window.location.search);
		const fromQuery = (params.get('branch') || params.get('targetBranch') || '').trim();
		if (fromQuery) return fromQuery;
		const host = window.location.hostname;
		if (!host.endsWith('.netlify.app') || !host.includes('--')) return '';
		const prefix = host.split('--')[0] || '';
		if (/^[a-f0-9]{20,}$/i.test(prefix)) return '';
		return prefix;
	};

	let targetBranch = '';

	const normalizeListDisplay = (value) => {
		const text = String(value || '').trim();
		if (!text || text.toLowerCase() === 'unlisted') return 'NONE';
		return text
			.toUpperCase()
			.split(/\s+/)
			.filter(Boolean)
			.join(', ');
	};

	const normalizeAdditionalLines = (value) =>
		String(value || '')
			.split(',')
			.map((entry) => entry.trim())
			.filter(Boolean);

	const normalizeTitleCopy = (value) =>
		String(value || '')
			.trim()
			.replace(/\s+/g, ' ')
			.toUpperCase();

	const loadItemSettings = () => {
		if (typeof window === 'undefined') return {};
		try {
			const raw = window.localStorage.getItem(ITEM_SETTINGS_KEY);
			return raw ? JSON.parse(raw) : {};
		} catch {
			return {};
		}
	};

	const saveItemSettings = (nextSettings) => {
		storedItemSettings = nextSettings;
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(ITEM_SETTINGS_KEY, JSON.stringify(nextSettings));
		} catch {
			// ignore
		}
	};

	const persistSelectedItemSettings = (patch) => {
		if (!selectedId) return;
		const currentSettings = storedItemSettings?.[selectedId] || {};
		saveItemSettings({
			...storedItemSettings,
			[selectedId]: {
				...currentSettings,
				...patch
			}
		});
	};

	const resetTitleTreatment = () => {
		titleShrinkApplied = false;
		titleSubApplied = false;
		titleMain = normalizedTitle;
		titleSub = '';
	};

	const resetDescriptionTreatment = () => {
		descFitLevel = 0;
	};

	const resetSpecTreatment = () => {
		specFitLevel = 0;
	};

	const clampDescLevel = (value) => Math.max(0, Math.min(MAX_DESC_SIZE_LEVEL, Number(value) || 0));
	const clampSpecLevel = (value) => Math.max(0, Math.min(MAX_SPEC_SIZE_LEVEL, Number(value) || 0));

	const checkTitleWrapped = () => {
		if (!titleMainEl || titleSubApplied) return false;
		const computed = window.getComputedStyle(titleMainEl);
		const lineHeight = parseFloat(computed.lineHeight || '0');
		if (!lineHeight) return false;
		return titleMainEl.scrollHeight > lineHeight * 1.5;
	};

	const checkTitleOverflow = () =>
		Boolean(checkElementOverflow(titleMainEl) || checkElementOverflow(titleSubEl));

	const measureTitleSplit = () => {
		if (typeof window === 'undefined' || !titleMainEl) return null;
		const fullTitle = normalizeTitleCopy(product?.title);
		if (!fullTitle) return null;
		const words = fullTitle.split(' ').filter(Boolean);
		if (words.length < 2) return null;

		const computed = window.getComputedStyle(titleMainEl);
		const probe = document.createElement('span');
		probe.style.position = 'absolute';
		probe.style.visibility = 'hidden';
		probe.style.pointerEvents = 'none';
		probe.style.whiteSpace = 'nowrap';
		probe.style.fontFamily = computed.fontFamily;
		probe.style.fontSize = computed.fontSize;
		probe.style.fontWeight = computed.fontWeight;
		probe.style.letterSpacing = computed.letterSpacing;
		probe.style.lineHeight = computed.lineHeight;
		probe.style.textTransform = computed.textTransform;
		document.body.appendChild(probe);

		const availableWidth = titleMainEl.clientWidth;
		let bestIndex = 0;

		for (let index = 1; index < words.length; index += 1) {
			probe.textContent = words.slice(0, index).join(' ');
			if (probe.offsetWidth <= availableWidth) {
				bestIndex = index;
			} else {
				break;
			}
		}

		document.body.removeChild(probe);
		if (words.length - bestIndex === 1 && bestIndex > 1) {
			bestIndex -= 1;
		}
		if (!bestIndex || bestIndex >= words.length) return null;
		return {
			main: words.slice(0, bestIndex).join(' '),
			sub: words.slice(bestIndex).join(' ')
		};
	};

	const loadProducts = async () => {
		status = '';
		loadingList = true;
		try {
			const res = await fetch('/data/admin/pricecard/list', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				items = [];
				unlocked = false;
				return;
			}
			items = Array.isArray(data?.items) ? data.items : [];
			unlocked = true;
			status = items.length ? `Loaded ${items.length} price card candidates.` : 'No matching products found.';
			if (items.length && !selectedId) {
				await selectProduct(items[0].id);
			}
		} catch (error) {
			status = `Network error: ${error?.message || error}`;
		} finally {
			loadingList = false;
		}
	};

	const selectProduct = async (id) => {
		if (!id) return;
		status = '';
		selectedId = id;
		loadingProduct = true;
		try {
			const res = await fetch(`/data/admin/pricecard/product/${id}`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				product = null;
				return;
			}
			product = data?.product ?? null;
		} catch (error) {
			status = `Network error: ${error?.message || error}`;
			product = null;
		} finally {
			loadingProduct = false;
		}
	};

	const printCard = () => {
		if (typeof window === 'undefined') return;
		window.print();
	};

	const checkElementOverflow = (element) =>
		Boolean(
			element &&
				(element.scrollHeight - element.clientHeight > 1 ||
					element.scrollWidth - element.clientWidth > 1)
		);

	const updateOversetWarnings = () => {
		if (!product) {
			oversetWarnings = [];
			previewNote = status || 'No product selected.';
			return;
		}

		const nextWarnings = [];
		const descriptionOverflow = checkElementOverflow(descEl);
		const titleWrapped = checkTitleWrapped();
		const titleOverflow = checkTitleOverflow();
		const leftBoxOverflow = checkElementOverflow(leftBoxEl);
		const rightColumnOverflow = Boolean(
			leftBoxEl && rightColumnEl && rightColumnEl.scrollHeight - leftBoxEl.clientHeight > 1
		);

		if (
			autoFitDescription &&
			(descriptionOverflow || leftBoxOverflow) &&
			descBaseLevel + descFitLevel < MAX_DESC_SIZE_LEVEL
		) {
			descFitLevel += 1;
			previewNote = 'Description auto-fit applied to keep body copy within the card.';
			scheduleOversetCheck();
			return;
		}

		if (
			autoFitSpecs &&
			rightColumnOverflow &&
			specBaseLevel + specFitLevel < MAX_SPEC_SIZE_LEVEL
		) {
			specFitLevel += 1;
			previewNote = 'Spec auto-fit applied to keep right-column details within the card.';
			scheduleOversetCheck();
			return;
		}

		if (shrinkTitleForOverset && (descriptionOverflow || titleWrapped || titleOverflow) && !titleShrinkApplied) {
			titleShrinkApplied = true;
			previewNote = descriptionOverflow
				? 'Title shrink assist applied to create more room for description copy.'
				: 'Title shrink assist applied to preserve the full product name on one line.';
			scheduleOversetCheck();
			return;
		}

		if (titleShrinkApplied && titleOverflow && !titleSubApplied) {
			const splitTitle = measureTitleSplit();
			if (splitTitle) {
				titleMain = splitTitle.main;
				titleSub = splitTitle.sub;
				titleSubApplied = true;
				previewNote = 'Title subheader fallback applied to preserve the full product name.';
				scheduleOversetCheck();
				return;
			}
		}

		if (titleOverflow) {
			nextWarnings.push('Title exceeds the allotted title area.');
		}
		if (descriptionOverflow) {
			nextWarnings.push('Description exceeds the allotted description area.');
		}
		if (leftBoxOverflow) {
			nextWarnings.push('Left-side content exceeds the black card panel.');
		}
		if (rightColumnOverflow) {
			nextWarnings.push('Right-side specs exceed the card height.');
		}

		oversetWarnings = nextWarnings;
		if (loadingProduct) {
			previewNote = 'Loading selected product…';
		} else if (nextWarnings.length) {
			previewNote = `${nextWarnings.length} overset warning${nextWarnings.length === 1 ? '' : 's'} detected.`;
		} else if (titleShrinkApplied || descFitLevel || specFitLevel) {
			const assists = [
				titleShrinkApplied ? 'title assist' : '',
				descFitLevel ? 'description auto-fit' : '',
				specFitLevel ? 'spec auto-fit' : ''
			].filter(Boolean);
			previewNote = `${assists.join(', ')} active and card content fits within the fixed layout.`;
		} else {
			previewNote = 'Card content fits within the fixed layout.';
		}
	};

	const scheduleOversetCheck = async () => {
		if (typeof window === 'undefined') return;
		await tick();
		window.cancelAnimationFrame(oversetFrame);
		oversetFrame = window.requestAnimationFrame(updateOversetWarnings);
	};

	onMount(async () => {
		password = loadPasswordFromSession();
		const inferredBranch = inferBranchFromHost();
		if (inferredBranch) {
			targetBranch = inferredBranch;
			window.sessionStorage.setItem(BRANCH_STORAGE_KEY, inferredBranch);
		}
		targetBranch = window.sessionStorage.getItem(BRANCH_STORAGE_KEY) || targetBranch;
		if (password) {
			await loadProducts();
		}
		storedItemSettings = loadItemSettings();

		resizeObserver = new ResizeObserver(() => {
			scheduleOversetCheck();
		});
			[cardCanvasEl, leftBoxEl, titleEl, titleMainEl, titleSubEl, descEl, rightColumnEl, infoPanelEl].forEach((element) => {
				if (element) resizeObserver.observe(element);
			});

		window.addEventListener('resize', scheduleOversetCheck);
		return () => {
			window.removeEventListener('resize', scheduleOversetCheck);
			resizeObserver?.disconnect();
			window.cancelAnimationFrame(oversetFrame);
		};
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
		if (typeof window !== 'undefined') {
			window.cancelAnimationFrame(oversetFrame);
		}
	});

	$: visibleItems = items.filter((item) => {
		const query = search.trim().toLowerCase();
		if (!query) return true;
		return (
			item.title.toLowerCase().includes(query) ||
			item.department.toLowerCase().includes(query) ||
			item.barcode.toLowerCase().includes(query)
		);
	});

	$: priceParts = String(product?.price || '0.00').split('.');
	$: dollars = priceParts[0] || '0';
	$: cents = priceParts[1] || '00';
	$: additionalLines = normalizeAdditionalLines(product?.additional);
	$: {
		const nextNormalizedTitle = normalizeTitleCopy(product?.title);
		if (nextNormalizedTitle !== normalizedTitle) {
			normalizedTitle = nextNormalizedTitle;
			resetTitleTreatment();
			resetDescriptionTreatment();
		}
	}
	$: if (selectedId) {
		shrinkTitleForOverset = storedItemSettings?.[selectedId]?.shrinkTitleForOverset ?? true;
		autoFitDescription = storedItemSettings?.[selectedId]?.autoFitDescription ?? true;
		autoFitSpecs = storedItemSettings?.[selectedId]?.autoFitSpecs ?? true;
		descBaseLevel = clampDescLevel(storedItemSettings?.[selectedId]?.descBaseLevel ?? 0);
		specBaseLevel = clampSpecLevel(storedItemSettings?.[selectedId]?.specBaseLevel ?? 0);
	} else {
		shrinkTitleForOverset = true;
		autoFitDescription = true;
		autoFitSpecs = true;
		descBaseLevel = 0;
		specBaseLevel = 0;
	}
	$: if (!shrinkTitleForOverset && (titleShrinkApplied || titleSubApplied || titleMain !== normalizedTitle || titleSub)) {
		resetTitleTreatment();
	}
	$: if (!autoFitDescription && descFitLevel) {
		resetDescriptionTreatment();
	}
	$: if (!autoFitSpecs && specFitLevel) {
		resetSpecTreatment();
	}
	$: if (selectedId !== titleShrinkSelectionId) {
		titleShrinkSelectionId = selectedId;
		resetTitleTreatment();
		resetDescriptionTreatment();
		resetSpecTreatment();
	}
	$: effectiveDescLevel = clampDescLevel(descBaseLevel + descFitLevel);
	$: effectiveDescFontSize = `${DESC_BASE_FONT_SIZE - effectiveDescLevel * DESC_STEP}pt`;
	$: effectiveDescLineHeight =
		effectiveDescLevel >= 7 ? 1.03 : effectiveDescLevel >= 5 ? 1.06 : effectiveDescLevel >= 3 ? 1.1 : 1.14;
	$: effectiveSpecLevel = clampSpecLevel(specBaseLevel + specFitLevel);
	$: effectiveSpecFontSize = `${SPEC_BASE_FONT_SIZE - effectiveSpecLevel * SPEC_STEP}pt`;
	$: descSliderValue = MAX_DESC_SIZE_LEVEL - descBaseLevel;
	$: specSliderValue = MAX_SPEC_SIZE_LEVEL - specBaseLevel;
	$: scheduleOversetCheck();
</script>

<svelte:head>
	<title>Price Card Tool</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="wrap">
	<header class="adminTop no-print">
		<div class="adminLeft">
			<a class="navBtn ghost" href="/cms-admin">Sections</a>
			<span class="editingHint">Price card generator</span>
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
			<h1 class="pageTitle no-print">Price Card Tool</h1>
			{#if !unlocked}
				<form
					class="unlockPanel no-print"
					on:submit|preventDefault={loadProducts}
				>
				<label class="field passwordField">
					<span>Password</span>
					<input
						type="text"
						bind:value={password}
						autocomplete="off"
						autocapitalize="none"
						spellcheck="false"
						on:input={(event) => savePasswordToSession(event.currentTarget.value)}
					/>
				</label>
				<div class="unlockActions">
					<button class="btn primary" type="submit" disabled={!password || loadingList}>
						{loadingList ? 'Unlocking…' : 'Unlock Price Card Tool'}
					</button>
				</div>
				<p class="pickerMeta">Use the same CMS admin password to load live price-card product data.</p>
			</form>
			{:else}
				<div class="toolBar no-print">
					<label class="field">
						<span>Search</span>
						<input type="text" bind:value={search} placeholder="Search title, department, or barcode" />
					</label>
				<button class="btn" type="button" on:click={loadProducts} disabled={loadingList}>
					{loadingList ? 'Refreshing…' : 'Refresh Products'}
				</button>
				<button class="btn" type="button" on:click={() => { unlocked = false; items = []; product = null; selectedId = null; }}>
					Lock Tool
				</button>
					<button class="btn" type="button" on:click={printCard} disabled={!product}>
						Print Card
					</button>
				</div>
				<div class="settingsBar no-print">
					<div class="settingsBarLabel">Preview Settings</div>
					<div class="settingsBarControls">
							<div class="toolbarControl compact">
								<span class="toolbarControlLabel">Shrink title</span>
							<button
								class:active={shrinkTitleForOverset}
								aria-pressed={shrinkTitleForOverset}
								aria-label="Toggle title shrink assist"
								class="toolbarSwitch"
								type="button"
								on:click={() => {
									shrinkTitleForOverset = !shrinkTitleForOverset;
									persistSelectedItemSettings({
										shrinkTitleForOverset
									});
									if (!shrinkTitleForOverset) resetTitleTreatment();
									scheduleOversetCheck();
								}}
							>
								<span class="switchTrack"></span>
								<span class="switchThumb"></span>
								</button>
							</div>
							<div class="toolbarControl compact">
								<span class="toolbarControlLabel">Auto-fit desc</span>
								<button
									class:active={autoFitDescription}
									aria-pressed={autoFitDescription}
									aria-label="Toggle description auto-fit"
									class="toolbarSwitch"
									type="button"
									on:click={() => {
										autoFitDescription = !autoFitDescription;
										persistSelectedItemSettings({
											autoFitDescription
										});
										if (!autoFitDescription) resetDescriptionTreatment();
										scheduleOversetCheck();
									}}
								>
									<span class="switchTrack"></span>
									<span class="switchThumb"></span>
								</button>
							</div>
							<div class="toolbarControl compact sliderControl">
								<span class="toolbarControlLabel">Desc size</span>
								<input
									class="sizeSlider"
									type="range"
									min="0"
									max={MAX_DESC_SIZE_LEVEL}
									step="1"
									bind:value={descSliderValue}
									aria-label="Description type size"
									on:input={() => {
										descBaseLevel = clampDescLevel(MAX_DESC_SIZE_LEVEL - Number(descSliderValue));
										autoFitDescription = false;
										persistSelectedItemSettings({
											descBaseLevel,
											autoFitDescription
										});
										resetDescriptionTreatment();
										scheduleOversetCheck();
									}}
								/>
								<span class="sliderValue">{effectiveDescFontSize}</span>
							</div>
							<div class="toolbarControl compact">
								<span class="toolbarControlLabel">Auto-fit specs</span>
								<button
									class:active={autoFitSpecs}
									aria-pressed={autoFitSpecs}
									aria-label="Toggle spec auto-fit"
									class="toolbarSwitch"
									type="button"
									on:click={() => {
										autoFitSpecs = !autoFitSpecs;
										persistSelectedItemSettings({
											autoFitSpecs
										});
										if (!autoFitSpecs) resetSpecTreatment();
										scheduleOversetCheck();
									}}
								>
									<span class="switchTrack"></span>
									<span class="switchThumb"></span>
								</button>
							</div>
							<div class="toolbarControl compact sliderControl">
								<span class="toolbarControlLabel">Specs size</span>
								<input
									class="sizeSlider"
									type="range"
									min="0"
									max={MAX_SPEC_SIZE_LEVEL}
									step="1"
									bind:value={specSliderValue}
									aria-label="Spec type size"
									on:input={() => {
										specBaseLevel = clampSpecLevel(MAX_SPEC_SIZE_LEVEL - Number(specSliderValue));
										autoFitSpecs = false;
										persistSelectedItemSettings({
											specBaseLevel,
											autoFitSpecs
										});
										resetSpecTreatment();
										scheduleOversetCheck();
									}}
								/>
								<span class="sliderValue">{effectiveSpecFontSize}</span>
							</div>
							<span class:warn={oversetWarnings.length > 0} class="previewBadge compact">
							{#if loadingProduct}
								Loading…
							{:else if oversetWarnings.length}
								Overset
							{:else}
								Ready
							{/if}
						</span>
					</div>
				</div>

					<div class="toolLayout">
							<div class="pickerCard no-print">
						<p class="pickerMeta">
						{#if items.length}
							Showing {visibleItems.length} of {items.length} items
						{:else}
							No matching products found
						{/if}
					</p>

					<div class="itemList">
						{#each visibleItems as item}
							<button
								type="button"
								class:selected={item.id === selectedId}
								class="itemButton"
								on:click={() => selectProduct(item.id)}
							>
								<span class="itemTitle">{item.title}</span>
								<span class="itemMeta">{item.department} • ${item.price}</span>
								{#if item.barcode}
									<span class="itemCode">{item.barcode}</span>
								{/if}
							</button>
						{/each}
					</div>
						</div>

							<div class="previewPanel">
									<div class="previewToolbar no-print">
									<div class="previewToolbarMain">
										<span class="previewToolbarLabel">Live Preview</span>
										{#if product}
											<span class="previewToolbarMeta">{product.title}</span>
										{/if}
									</div>
								</div>
							<div class="previewStage">
								{#if product}
									<div transition:fade={{ duration: 120 }} class="cardShell">
											<div bind:this={cardCanvasEl} contenteditable="true" class="cardCanvas" on:input={scheduleOversetCheck}>
											<div class="container-left">
											<div bind:this={leftBoxEl} class="left-box">
												<div class="price" id="price">
													<div class="sign" id="sign">$</div>
													<div class="dollars" id="dollars">{dollars}</div>
													<div class="cents" id="cents">{cents}</div>
												</div>
												<div class="single-price-block">
													<div class="single-price-label block">HighRoller Price</div>
													<div class="block">
														<span>Single Item: $</span>
														<span id="single-price">{product.singlePrice}</span>
													</div>
												</div>
												<div
													bind:this={titleEl}
													class:title-shrunk={titleShrinkApplied && !titleSubApplied}
													class:title-subheader-mode={titleSubApplied}
													class="title"
													id="title"
												>
													<span bind:this={titleMainEl} class="titleMain">{titleMain}</span>
													{#if titleSubApplied && titleSub}
														<span bind:this={titleSubEl} class="titleSub">{titleSub}</span>
													{/if}
												</div>
													<div
														bind:this={descEl}
														class="desc"
														id="desc"
														style={`font-size: ${effectiveDescFontSize}; line-height: ${effectiveDescLineHeight};`}
													>
														{product.desc}
													</div>
											</div>
										</div>
											<div
												bind:this={rightColumnEl}
												class="container-right"
												style={`font-size: ${effectiveSpecFontSize};`}
											>
												<div id="department-container">
													<span class="department" id="department">{product.department.toUpperCase()}</span>
												</div>
											<div class="singles" id="singles">
												<div class="single" id="duration-container">
													DURATION:
													<span class="duration single-result" id="duration">
														{product.duration.toLowerCase() === 'unlisted'
															? 'UNLISTED'
															: `${product.duration.toUpperCase()} SEC`}
													</span>
												</div>
												{#if product.height.toLowerCase() !== 'unlisted'}
													<div class="single" id="height-container">
														HEIGHT:
														<span class="height single-result" id="height">{product.height.toUpperCase()} FT</span>
													</div>
												{/if}
												{#if product.shots.toLowerCase() !== 'unlisted'}
													<div class="single" id="shots-container">
														SHOTS: <span class="shots single-result" id="shots">{product.shots.toUpperCase()}</span>
													</div>
												{/if}
												{#if product.style.toLowerCase() !== 'unlisted'}
													<div class="single" id="style-container">
														STYLE: <span class="style single-result" id="style">{product.style.toUpperCase()}</span>
													</div>
												{/if}
												<div class="lists">
													<div class="list-title">COLORS:</div>
													<div class="colors list-items" id="colors">{normalizeListDisplay(product.colors)}</div>
												</div>
												<div class="lists">
													<div class="list-title">BREAKS AND EFFECTS:</div>
													<div class="effects list-items" id="effects">{normalizeListDisplay(product.effects)}</div>
												</div>
												<div class="lists">
													<div class="list-title">SOUNDS:</div>
													<div class="sounds list-items" id="sounds">{normalizeListDisplay(product.sounds)}</div>
												</div>
												{#if additionalLines.length}
													<div class="lists">
														<div class="list-title" id="additional">
															{#each additionalLines as line, index}
																{line.toUpperCase()}{index < additionalLines.length - 1 ? '' : ''}
																{#if index < additionalLines.length - 1}<br />{/if}
															{/each}
														</div>
													</div>
												{/if}
											</div>
										</div>
									</div>
								</div>
							{:else}
									<div class="emptyState">Load products and select an item to preview a price card.</div>
								{/if}
							</div>
							<div bind:this={infoPanelEl} class="previewInfo no-print">
								<div class="infoGrid">
									<div class="infoCard">
										<div class="infoLabel">Card Info</div>
										{#if product}
											<div class="infoRows">
												<div><span>Barcode</span><strong>{product.barcode || 'Unlisted'}</strong></div>
												<div><span>Department</span><strong>{product.department}</strong></div>
												<div><span>Deal Price</span><strong>${product.price}</strong></div>
												<div><span>Single Price</span><strong>${product.singlePrice}</strong></div>
											</div>
										{:else}
											<p class="infoEmpty">No product loaded.</p>
										{/if}
									</div>
									<div class="infoCard">
										<div class="infoLabel">Preview Notes</div>
										<p class="infoSummary">{previewNote}</p>
										{#if status}
											<p class="infoStatus">{status}</p>
										{/if}
										{#if oversetWarnings.length}
											<ul class="warningList">
												{#each oversetWarnings as warning}
													<li>{warning}</li>
												{/each}
											</ul>
										{:else}
											<p class="infoEmpty">No warnings.</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
		{#if status && !unlocked}
			<p class="status">{status}</p>
		{/if}
	</section>

</main>

<style>
	@font-face {
		font-family: 'Langdon';
		font-style: normal;
		font-weight: normal;
		src: local('Langdon'), url('/fonts/langdon/langdon-webfont.woff') format('woff');
	}

	.wrap {
		min-height: 100vh;
		padding: 86px 16px 24px;
		box-sizing: border-box;
		background:
			radial-gradient(900px 500px at 20% 10%, rgba(255, 199, 0, 0.12), transparent 55%),
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
		max-width: 1200px;
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

	.toolBar {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: end;
		margin-bottom: 10px;
	}

	.settingsBar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
		padding: 8px 10px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.035);
	}

	.settingsBarLabel {
		font-size: 11px;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		opacity: 0.68;
	}

	.settingsBarControls {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.passwordField {
		min-width: 240px;
	}

	.unlockPanel {
		display: grid;
		gap: 14px;
		max-width: 420px;
		padding: 14px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.05);
	}

	.unlockActions {
		display: flex;
		gap: 10px;
	}

	.field {
		display: grid;
		gap: 6px;
	}

	.field span,
	.pickerMeta,
	.status {
		font-size: 13px;
	}

	input {
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		border-radius: 10px;
		padding: 10px 12px;
	}

	.btn {
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		border-radius: 10px;
		padding: 10px 14px;
		cursor: pointer;
	}

	.btn.primary {
		background: rgba(255, 199, 0, 0.18);
		border-color: rgba(255, 199, 0, 0.45);
	}

	.btn:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.toolLayout {
		display: grid;
		grid-template-columns: minmax(280px, 360px) 1fr;
		gap: 16px;
	}

	.pickerCard,
	.previewPanel {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.05);
		padding: 14px;
	}

	.previewPanel {
		display: grid;
		grid-template-rows: auto auto auto;
		gap: 14px;
	}

	.itemList {
		display: grid;
		gap: 8px;
		max-height: 480px;
		overflow: auto;
		padding-right: 4px;
	}

	.itemButton {
		text-align: left;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
		color: inherit;
		padding: 10px 12px;
		cursor: pointer;
		display: grid;
		gap: 4px;
	}

	.itemButton.selected {
		border-color: rgba(255, 199, 0, 0.6);
		background: rgba(255, 199, 0, 0.12);
	}

	.itemTitle {
		font-weight: 700;
	}

	.itemMeta,
	.itemCode {
		font-size: 12px;
		opacity: 0.78;
	}

	.previewStage {
		overflow: clip;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 2px;
	}

	.cardShell {
		background: white;
		padding: 16px;
		border-radius: 18px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
		width: fit-content;
		max-width: 100%;
		overflow: clip;
	}

	.cardCanvas {
		display: flex;
		color: black;
		width: 5.5in;
		min-width: 5.5in;
		outline: none;
	}

	.container-left {
		display: flex;
		justify-content: left;
	}

	.container-right {
		font-family: Langdon, sans-serif;
		font-size: 12pt;
		line-height: 1.08;
		margin-left: 0.15in;
		width: 2in;
	}

	.left-box {
		background-color: black;
		height: 3.2in;
		width: 3in;
		padding: 0.05in;
		box-sizing: border-box;
	}

	.title {
		float: none;
		clear: both;
		font-family: Langdon, sans-serif;
		font-size: 24pt;
		color: white;
		padding-left: 0.1in;
		padding-right: 0.1in;
		display: block;
		width: 100%;
		box-sizing: border-box;
	}

	.title-shrunk {
		font-size: 16pt;
		line-height: 1;
	}

	.title-subheader-mode {
		line-height: 0.95;
	}

	.titleMain,
	.titleSub {
		display: block;
		width: 100%;
		box-sizing: border-box;
	}

	.titleMain {
		white-space: normal;
		overflow: visible;
	}

	.titleSub {
		margin-top: 0.03in;
		font-size: 10pt;
		letter-spacing: 0.04em;
		overflow: hidden;
		white-space: nowrap;
	}

	.title-shrunk .titleMain,
	.title-subheader-mode .titleMain {
		white-space: nowrap;
		overflow: hidden;
	}

	.price {
		color: white;
		font-family: Langdon, sans-serif;
		display: flex;
		margin-top: -0.1in;
	}

	.sign {
		display: block;
		font-size: 45pt;
		font-style: italic;
		padding-bottom: 0.25in;
		margin-top: 0.1in;
	}

	.dollars {
		display: block;
		font-size: 80pt;
		font-style: italic;
		letter-spacing: -0.06em;
		position: relative;
		left: -0.1in;
	}

	.cents {
		display: block;
		font-size: 45pt;
		text-decoration: underline;
		font-style: italic;
		margin-top: 0.1in;
		margin-left: 0.1in;
	}

	.desc {
		color: white;
		font-family: Cambria, Georgia, serif;
		font-style: italic;
		text-align: justify;
		text-justify: inter-word;
		padding-left: 0.1in;
		padding-right: 0.1in;
		overflow: clip;
	}

	.lists,
	.singles {
		margin-top: 0.05in;
		font-size: 1.083em;
	}

	.single-result,
	.list-items {
		color: #555555;
		font-style: italic;
	}

	.list-items {
		margin-left: 0.1in;
	}

	.list-title {
		font-family: Langdon, sans-serif;
	}

	.department {
		font-size: 16pt;
		line-height: 1;
		margin-bottom: 0.1in;
		margin-top: 0.06in;
		display: inline-block;
	}

	.single-price-block {
		display: flex;
		justify-content: flex-end;
		margin-top: -1.5em;
		margin-bottom: 0.5em;
		flex-direction: column;
		align-content: center;
		align-items: flex-end;
		color: white;
	}

	.block {
		display: block;
	}

	.emptyState {
		padding: 32px;
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.previewToolbar {
		display: flex;
		justify-content: flex-start;
		gap: 12px;
		align-items: center;
		padding: 9px 12px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
	}

	.previewToolbarMain {
		display: grid;
		gap: 4px;
		min-width: 0;
	}

	.previewToolbarLabel {
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.72;
	}

	.previewToolbarMeta {
		font-size: 14px;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toolbarControl {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.04);
	}

	.toolbarControl.compact {
		padding: 4px 8px;
		gap: 8px;
	}

	.sliderControl {
		gap: 6px;
	}

	.toolbarControlLabel {
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.78;
		white-space: nowrap;
	}

	.toolbarControl.compact .toolbarControlLabel {
		font-size: 11px;
	}

	.sizeSlider {
		width: 92px;
		padding: 0;
		border: 0;
		background: transparent;
		accent-color: #ffc700;
	}

	.sliderValue {
		min-width: 34px;
		font-size: 10px;
		text-align: right;
		opacity: 0.82;
	}

	.toolbarSwitch {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 24px;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	.toolbarControl.compact .toolbarSwitch {
		width: 34px;
		height: 20px;
	}

	.toolbarSwitch:disabled {
		cursor: default;
		opacity: 0.55;
	}

	.switchTrack {
		position: absolute;
		inset: 2px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.18);
	}

	.switchThumb {
		position: absolute;
		left: 5px;
		width: 14px;
		height: 14px;
		border-radius: 999px;
		background: #eef0f6;
	}

	.toolbarControl.compact .switchThumb {
		left: 4px;
		width: 12px;
		height: 12px;
	}

	.toolbarSwitch.active .switchTrack {
		background: rgba(255, 199, 0, 0.2);
		border-color: rgba(255, 199, 0, 0.45);
	}

	.toolbarSwitch.active .switchThumb {
		left: 21px;
		background: #ffc700;
	}

	.toolbarControl.compact .toolbarSwitch.active .switchThumb {
		left: 18px;
	}

	.previewBadge {
		padding: 6px 10px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.14);
	}

	.previewBadge.compact {
		padding: 4px 8px;
		font-size: 11px;
	}

	.previewBadge.warn {
		background: rgba(255, 184, 77, 0.14);
		border-color: rgba(255, 184, 77, 0.38);
		color: #ffd38d;
	}

	.previewInfo {
		padding: 0;
	}

	.infoGrid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.infoCard {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
		padding: 12px 14px;
	}

	.infoLabel {
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.72;
		margin-bottom: 10px;
	}

	.infoRows {
		display: grid;
		gap: 8px;
	}

	.infoRows div {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 13px;
	}

	.infoRows span {
		opacity: 0.72;
	}

	.infoRows strong {
		text-align: right;
	}

	.infoSummary,
	.infoStatus,
	.infoEmpty {
		margin: 0 0 10px;
		font-size: 13px;
	}

	.infoStatus {
		color: #cfe5ff;
	}

	.warningList {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 6px;
		font-size: 13px;
		color: #ffd38d;
	}

	.itemList {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.05);
	}

	.itemList::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}

	.itemList::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 999px;
	}

	.itemList::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.22);
		border-radius: 999px;
		border: 2px solid rgba(8, 8, 11, 0.25);
	}

	.itemList::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.32);
	}

	@media (max-width: 960px) {
		.toolLayout {
			grid-template-columns: 1fr;
		}

		.infoGrid {
			grid-template-columns: 1fr;
		}
	}

	@media print {
		@page {
			margin: 0;
			size: 5.5in 3.5in;
		}

		:global(html) {
			width: 5.5in;
			height: 3.5in;
			margin: 0;
			padding: 0;
			overflow: hidden;
		}

		:global(body) {
			width: 5.5in;
			height: 3.5in;
			margin: 0;
			padding: 0;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
			background: white !important;
			overflow: hidden;
		}

		.no-print {
			display: none !important;
		}

		.wrap {
			width: 5.5in;
			height: 3.5in;
			padding: 0;
			background: white !important;
			min-height: auto;
			overflow: hidden;
		}

		.panel {
			margin: 0;
			padding: 0;
			border: 0;
			border-radius: 0;
			background: transparent;
			max-width: none;
			width: 5.5in;
			height: 3.5in;
			overflow: hidden;
		}

		.toolLayout {
			display: block;
			gap: 0;
			width: 5.5in;
			height: 3.5in;
			overflow: hidden;
		}

		.previewPanel {
			display: block;
			padding: 0;
			border: 0;
			border-radius: 0;
			background: transparent;
			min-height: auto;
			width: 5.5in;
			height: 3.5in;
			overflow: hidden;
		}

		.previewStage {
			padding: 0;
			margin: 0;
			display: block;
			overflow: visible;
			width: 5.5in;
			height: 3.5in;
			page-break-inside: avoid;
			break-inside: avoid;
		}

		.cardShell {
			padding: 0;
			margin: 0;
			border-radius: 0;
			box-shadow: none;
			overflow: visible;
			background: white;
			width: 5.5in;
			height: 3.5in;
			max-width: none;
			page-break-inside: avoid;
			break-inside: avoid;
		}

		.cardCanvas {
			width: 5.5in;
			min-width: 5.5in;
			height: 3.5in;
			page-break-inside: avoid;
			break-inside: avoid;
		}
	}
</style>
