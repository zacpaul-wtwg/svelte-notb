import {
	STORE_TIMEZONE,
	addDaysToIsoDate,
	getNowInTimezone,
	parseTimeToMinutes,
	resolveHoursForDate
} from './hours.js';
import { formatTimeLabel } from '../utility/time.js';

export const PICKUP_SLOT_STEP_MINUTES = 15;

export const normalizeMaxDaysOut = (value, fallback = 30) => {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.max(1, Math.min(365, Math.floor(parsed)));
};

const minutesToTimeValue = (minutes) => {
	const safeMinutes = Math.max(0, Math.min(23 * 60 + 59, Number(minutes) || 0));
	const hours = String(Math.floor(safeMinutes / 60)).padStart(2, '0');
	const mins = String(safeMinutes % 60).padStart(2, '0');
	return `${hours}:${mins}`;
};

const getSlotStatus = ({ dateValue, slotMinutes, nowMinutes, nowDate }) => {
	if (dateValue === nowDate && slotMinutes < nowMinutes) {
		return 'past';
	}
	return 'available';
};

export const getPickupTimeSlots = (
	cms,
	dateValue,
	{ now = getNowInTimezone(STORE_TIMEZONE), stepMinutes = PICKUP_SLOT_STEP_MINUTES } = {}
) => {
	const resolution = resolveHoursForDate(cms, dateValue);
	const hours = resolution.hours;
	if (!hours) {
		return {
			dateValue,
			source: resolution.source,
			status: 'unavailable',
			hours: null,
			slots: [],
			selectableSlots: []
		};
	}

	if (hours.closed || !hours.open || !hours.close) {
		return {
			dateValue,
			source: resolution.source,
			status: 'closed',
			hours,
			slots: [],
			selectableSlots: []
		};
	}

	const openMinutes = parseTimeToMinutes(hours.open);
	const closeMinutes = parseTimeToMinutes(hours.close);
	const safeStepMinutes = Math.max(1, Math.floor(Number(stepMinutes) || PICKUP_SLOT_STEP_MINUTES));
	if (openMinutes === null || closeMinutes === null || closeMinutes < openMinutes) {
		return {
			dateValue,
			source: resolution.source,
			status: 'unavailable',
			hours,
			slots: [],
			selectableSlots: []
		};
	}

	const nowMinutes = parseTimeToMinutes(now?.time) ?? 0;
	const nowDate = String(now?.date || '');
	const slots = [];
	for (let minutes = openMinutes; minutes <= closeMinutes; minutes += safeStepMinutes) {
		const value = minutesToTimeValue(minutes);
		const status = getSlotStatus({ dateValue, slotMinutes: minutes, nowMinutes, nowDate });
		slots.push({
			value,
			label: formatTimeLabel(value),
			minutes,
			status,
			selectable: status === 'available'
		});
	}

	const selectableSlots = slots.filter((slot) => slot.selectable);
	return {
		dateValue,
		source: resolution.source,
		status: selectableSlots.length ? 'open' : 'no_slots_left',
		hours,
		slots,
		selectableSlots
	};
};

export const getPickupAvailability = (
	cms,
	{ now = getNowInTimezone(STORE_TIMEZONE), maxDaysOut = 30, stepMinutes = PICKUP_SLOT_STEP_MINUTES } = {}
) => {
	const safeMaxDaysOut = normalizeMaxDaysOut(maxDaysOut);
	const startDate = String(now?.date || '');
	const dates = [];
	for (let offset = 0; offset <= safeMaxDaysOut; offset += 1) {
		const dateValue = addDaysToIsoDate(startDate, offset);
		const slotInfo = getPickupTimeSlots(cms, dateValue, { now, stepMinutes });
		dates.push({
			dateValue,
			offset,
			status: slotInfo.status,
			source: slotInfo.source,
			hours: slotInfo.hours,
			selectable: slotInfo.status === 'open',
			slotCount: slotInfo.selectableSlots.length,
			totalSlotCount: slotInfo.slots.length
		});
	}
	return dates;
};
