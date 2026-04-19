import assert from 'node:assert/strict';
import test from 'node:test';

import {
	PICKUP_SLOT_STEP_MINUTES,
	getPickupAvailability,
	getPickupTimeSlots,
	normalizeMaxDaysOut
} from '../src/lib/cms/pickup.js';

const cms = {
	pickupSettings: { maxDaysOut: 5 },
	regularHoursRanges: [
		{
			title: 'Spring Hours',
			startDate: '2026-04-01',
			endDate: '2026-04-30',
			hours: {
				sunday: { closed: false, open: '10:00', close: '12:00' },
				monday: { closed: true, open: '', close: '' },
				tuesday: { closed: false, open: '09:00', close: '11:00' },
				wednesday: { closed: false, open: '09:00', close: '17:00' },
				thursday: { closed: false, open: '09:00', close: '17:00' },
				friday: { closed: false, open: '10:00', close: '18:00' },
				saturday: { closed: false, open: '10:00', close: '18:00' }
			}
		}
	]
};

test('normalizeMaxDaysOut clamps invalid values to a safe range', () => {
	assert.equal(normalizeMaxDaysOut(undefined), 30);
	assert.equal(normalizeMaxDaysOut(0), 1);
	assert.equal(normalizeMaxDaysOut(999), 365);
	assert.equal(normalizeMaxDaysOut(14.9), 14);
});

test('getPickupTimeSlots returns 15-minute slots within open hours', () => {
	const result = getPickupTimeSlots(cms, '2026-04-21', {
		now: { date: '2026-04-19', time: '08:00' },
		stepMinutes: PICKUP_SLOT_STEP_MINUTES
	});

	assert.equal(result.status, 'open');
	assert.equal(result.hours.open, '09:00');
	assert.equal(result.hours.close, '11:00');
	assert.equal(result.slots[0].value, '09:00');
	assert.equal(result.slots.at(-1).value, '11:00');
	assert.equal(result.selectableSlots.length, 9);
});

test('getPickupTimeSlots marks past same-day slots as disabled', () => {
	const result = getPickupTimeSlots(cms, '2026-04-19', {
		now: { date: '2026-04-19', time: '10:30' },
		stepMinutes: PICKUP_SLOT_STEP_MINUTES
	});

	assert.equal(result.status, 'open');
	assert.equal(result.slots.find((slot) => slot.value === '10:00')?.selectable, false);
	assert.equal(result.slots.find((slot) => slot.value === '10:30')?.selectable, true);
	assert.equal(result.selectableSlots[0]?.value, '10:30');
});

test('getPickupTimeSlots reports no slots left when all same-day times have passed', () => {
	const result = getPickupTimeSlots(cms, '2026-04-19', {
		now: { date: '2026-04-19', time: '12:30' },
		stepMinutes: PICKUP_SLOT_STEP_MINUTES
	});

	assert.equal(result.status, 'no_slots_left');
	assert.equal(result.selectableSlots.length, 0);
});

test('getPickupAvailability marks closed and unavailable dates distinctly', () => {
	const availability = getPickupAvailability(cms, {
		now: { date: '2026-04-19', time: '08:00' },
		maxDaysOut: 12,
		stepMinutes: PICKUP_SLOT_STEP_MINUTES
	});

	const monday = availability.find((entry) => entry.dateValue === '2026-04-20');
	const coveredTuesday = availability.find((entry) => entry.dateValue === '2026-04-21');
	const uncoveredFriday = availability.find((entry) => entry.dateValue === '2026-05-01');

	assert.equal(monday?.status, 'closed');
	assert.equal(coveredTuesday?.status, 'open');
	assert.equal(uncoveredFriday?.status, 'unavailable');
});
