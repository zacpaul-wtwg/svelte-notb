export const weekdayKeys = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday'
];

export const STORE_TIMEZONE = 'America/New_York';

export const parseTimeToMinutes = (value) => {
	const match = String(value || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
	if (!match) return null;
	return Number(match[1]) * 60 + Number(match[2]);
};

export const getNowInTimezone = (timeZone) => {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(new Date());

	const getPart = (type) => parts.find((part) => part.type === type)?.value || '';
	return {
		date: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
		time: `${getPart('hour')}:${getPart('minute')}`
	};
};

export const parseIsoDate = (value) => {
	const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;
	const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
	return Number.isNaN(date.getTime()) ? null : date;
};

export const addDaysToIsoDate = (dateValue, days) => {
	const date = parseIsoDate(dateValue);
	if (!date) return '';
	date.setUTCDate(date.getUTCDate() + Number(days || 0));
	return date.toISOString().slice(0, 10);
};

const normalizeHoursEntry = (entry) => {
	if (!entry || typeof entry !== 'object') return null;

	if (entry.closed === true) {
		return {
			closed: true,
			open: '',
			close: ''
		};
	}

	const open = String(entry.open || '').trim();
	const close = String(entry.close || '').trim();
	if (parseTimeToMinutes(open) === null || parseTimeToMinutes(close) === null) {
		return null;
	}

	return {
		closed: false,
		open,
		close
	};
};

const getValidRegularRanges = (cms) => {
	const regularRanges = Array.isArray(cms?.regularHoursRanges) ? cms.regularHoursRanges : [];
	return regularRanges.filter((range) => {
		const start = parseIsoDate(range?.startDate);
		const end = parseIsoDate(range?.endDate);
		return Boolean(start && end && end >= start);
	});
};

export const findMatchingRegularRange = (cms, date) =>
	getValidRegularRanges(cms)
		.filter((range) => {
			const start = parseIsoDate(range?.startDate);
			const end = parseIsoDate(range?.endDate);
			return Boolean(start && end && date >= start && date <= end);
		})
		.sort((a, b) => String(b?.startDate || '').localeCompare(String(a?.startDate || '')))[0];

export const getHoursCoverageSummary = (cms, { dateValue, maxDaysOut = 0 } = {}) => {
	const baseDate = parseIsoDate(dateValue);
	if (!baseDate) {
		return {
			date: '',
			todayCovered: false,
			rangeState: 'none',
			activeRange: null,
			nextRange: null,
			latestRange: null,
			windowEndDate: '',
			firstUncoveredDate: ''
		};
	}

	const validRanges = getValidRegularRanges(cms).sort((a, b) =>
		String(a?.startDate || '').localeCompare(String(b?.startDate || ''))
	);
	const activeRange = findMatchingRegularRange(cms, baseDate) || null;
	const nextRange =
		validRanges.find((range) => {
			const start = parseIsoDate(range?.startDate);
			return Boolean(start && start > baseDate);
		}) || null;
	const latestRange =
		[...validRanges].sort((a, b) => String(b?.endDate || '').localeCompare(String(a?.endDate || '')))[0] ||
		null;

	let rangeState = 'none';
	if (activeRange) rangeState = 'active';
	else if (nextRange) rangeState = 'upcoming';
	else if (latestRange) rangeState = 'expired';

	const todayDate = baseDate.toISOString().slice(0, 10);
	const todayResolution = resolveHoursForDate(cms, todayDate);
	const todayCovered = Boolean(todayResolution.hours);
	const windowEndDate = addDaysToIsoDate(todayDate, maxDaysOut);

	let firstUncoveredDate = '';
	const windowDays = Math.max(0, Math.floor(Number(maxDaysOut) || 0));
	for (let offset = 0; offset <= windowDays; offset += 1) {
		const candidateDate = addDaysToIsoDate(todayDate, offset);
		if (!resolveHoursForDate(cms, candidateDate).hours) {
			firstUncoveredDate = candidateDate;
			break;
		}
	}

	return {
		date: todayDate,
		todayCovered,
		rangeState,
		activeRange,
		nextRange,
		latestRange,
		windowEndDate,
		firstUncoveredDate
	};
};

export const resolveHoursForDate = (cms, dateValue) => {
	const date = parseIsoDate(dateValue);
	if (!date) return { source: 'invalidDate', hours: null };

	const specialHours = Array.isArray(cms?.specialHours) ? cms.specialHours : [];
	let specialMatch = null;
	for (const occasion of specialHours) {
		for (const day of Array.isArray(occasion?.days) ? occasion.days : []) {
			if (String(day?.date || '') === dateValue) {
				specialMatch = day;
			}
		}
	}
	if (specialMatch) {
		return {
			source: 'special',
			hours: normalizeHoursEntry(specialMatch)
		};
	}

	const matchingRange = findMatchingRegularRange(cms, date);
	if (!matchingRange) {
		return { source: 'none', hours: null };
	}

	return {
		source: 'regularRange',
		hours: normalizeHoursEntry(matchingRange?.hours?.[weekdayKeys[date.getUTCDay()]])
	};
};

export const getRegularHoursForDate = (cms, dateValue) => {
	const date = parseIsoDate(dateValue);
	if (!date) return {};
	const matchingRange = findMatchingRegularRange(cms, date);
	return matchingRange?.hours && typeof matchingRange.hours === 'object' ? matchingRange.hours : {};
};
