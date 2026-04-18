const dayKeys = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday'
];

const CLOSED_DAY = { closed: true, open: '', close: '' };

const parseTimeToMinutes = (value) => {
	const match = String(value || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
	if (!match) return null;
	return Number(match[1]) * 60 + Number(match[2]);
};

const toIsoTime = (hourValue, minuteValue, meridiem) => {
	const hour = Number(hourValue);
	const minute = Number(minuteValue || '0');
	if (!Number.isInteger(hour) || hour < 1 || hour > 12) return null;
	if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
	const hours24 = hour % 12 + (String(meridiem).toUpperCase() === 'PM' ? 12 : 0);
	return `${String(hours24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const parseLegacyHoursString = (value) => {
	const raw = String(value || '').trim();
	if (!raw) return null;
	if (/^closed$/i.test(raw)) {
		return { ...CLOSED_DAY };
	}
	const compact = raw.replace(/\s+/g, '');
	const match = compact.match(
		/^(\d{1,2})(?::?(\d{2}))?(AM|PM)-(\d{1,2})(?::?(\d{2}))?(AM|PM)$/i
	);
	if (!match) return null;

	const open = toIsoTime(match[1], match[2], match[3]);
	const close = toIsoTime(match[4], match[5], match[6]);
	if (parseTimeToMinutes(open) === null || parseTimeToMinutes(close) === null) return null;
	return { closed: false, open, close };
};

const normalizeDayHours = (value, strictFallback) => {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		if (value.closed === true) return { ...CLOSED_DAY };
		const open = String(value.open || '').trim();
		const close = String(value.close || '').trim();
		if (parseTimeToMinutes(open) !== null && parseTimeToMinutes(close) !== null) {
			return { closed: false, open, close };
		}
	}

	const strictParsed = parseLegacyHoursString(strictFallback);
	if (strictParsed) return strictParsed;

	return { ...CLOSED_DAY };
};

const normalizeWeeklyHoursMap = (hours, strictHours) =>
	Object.fromEntries(
		dayKeys.map((dayKey) => [
			dayKey,
			normalizeDayHours(hours?.[dayKey], strictHours?.[`${dayKey}Hours`])
		])
	);

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const enumerateDateRange = (startDate, endDate) => {
	if (!isIsoDate(startDate) || !isIsoDate(endDate) || startDate > endDate) return [];
	const dates = [];
	const current = new Date(`${startDate}T00:00:00Z`);
	const final = new Date(`${endDate}T00:00:00Z`);
	while (current <= final) {
		dates.push(current.toISOString().slice(0, 10));
		current.setUTCDate(current.getUTCDate() + 1);
	}
	return dates;
};

const normalizeSpecialHours = (data) => {
	const normalized = [];
	const currentSpecialHours = Array.isArray(data?.specialHours) ? data.specialHours : [];

	currentSpecialHours.forEach((event, index) => {
		const title = String(event?.title || event?.occasion || '').trim() || `Event ${index + 1}`;
		const days = Array.isArray(event?.days)
			? event.days
					.map((day) => {
						const date = String(day?.date || '').trim();
						if (!isIsoDate(date)) return null;
						const normalizedDay = normalizeDayHours(day);
						return { date, ...normalizedDay };
					})
					.filter(Boolean)
			: [];

		normalized.push({ title, days });
	});

	const legacyClosedRanges = Array.isArray(data?.closedRange) ? data.closedRange : [];
	legacyClosedRanges.forEach((range, index) => {
		const title =
			String(range?.title || range?.occasion || '').trim() || `Closed Range ${index + 1}`;
		const dates = enumerateDateRange(range?.startOfBreak, range?.endOfBreak);
		if (!dates.length) return;
		normalized.push({
			title,
			days: dates.map((date) => ({ date, ...CLOSED_DAY }))
		});
	});

	return normalized;
};

const normalizeRegularHoursRanges = (data) => {
	const regularHoursRanges = Array.isArray(data?.regularHoursRanges) ? data.regularHoursRanges : [];
	if (regularHoursRanges.length) {
		return regularHoursRanges.map((range, index) => ({
			title: String(range?.title || '').trim(),
			startDate: isIsoDate(range?.startDate) ? String(range.startDate) : '',
			endDate: isIsoDate(range?.endDate) ? String(range.endDate) : '',
			hours: normalizeWeeklyHoursMap(range?.hours, null)
		}));
	}

	const migratedHours = normalizeWeeklyHoursMap(data?.hours, data?.regularHoursStrict);
	return [
		{
			title: String(data?.hours?.title || data?.regularHoursStrict?.title || 'Default Hours').trim(),
			startDate: '2000-01-01',
			endDate: '2099-12-31',
			hours: migratedHours
		}
	];
};

const normalizePickupSettings = (value) => {
	const parsed = Number(value?.maxDaysOut);
	return {
		maxDaysOut:
			Number.isFinite(parsed) && parsed >= 1 && parsed <= 365 ? Math.floor(parsed) : 30
	};
};

const normalizePricing = (data) => {
	if (!data || !Array.isArray(data.pricing)) return Array.isArray(data?.pricing) ? data.pricing : [];
	const marker = '\n\n#### Highlights\n';
	const toText = (s) =>
		String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1');
	return data.pricing.map((item) => {
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
				.map((line) => line.trim())
				.filter(Boolean)
				.map((line) => toText(line.replace(/^[\-•]\s*/, '').trim()));
			for (const section of sections.slice(1)) {
				const idx = section.indexOf('\n');
				if (idx === -1) continue;
				const name = section.slice(0, idx).trim().toLowerCase();
				const body = toText(section.slice(idx + 1).trim());
				if (name === 'how it works') out.howItWorks = body;
				if (name === 'best for') out.bestFor = body;
			}
		} else {
			out.subtitle = toText(entry.trim());
		}
		return out;
	});
};

export function normalizeCmsData(data) {
	const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
	const normalized = {
		...source,
		regularHoursRanges: normalizeRegularHoursRanges(source),
		pickupSettings: normalizePickupSettings(source.pickupSettings),
		specialHours: normalizeSpecialHours(source),
		pricing: normalizePricing(source),
		faq: Array.isArray(source.faq) ? source.faq : [],
		newsPosts:
			source.newsPosts && typeof source.newsPosts === 'object'
				? source.newsPosts
				: { title: '', date: '', body: '' },
		footerDescription:
			source.footerDescription && typeof source.footerDescription === 'object'
				? source.footerDescription
				: { body: '' }
	};

	delete normalized.hours;
	delete normalized.regularHoursStrict;
	delete normalized.closedRange;

	return normalized;
}
