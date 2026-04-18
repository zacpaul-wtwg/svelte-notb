import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCmsData } from '../src/lib/cms/normalize.js';

test('normalizeCmsData migrates legacy hours and closedRange to canonical schema', () => {
	const normalized = normalizeCmsData({
		hours: {
			title: 'Store Hours',
			friday: { closed: false, open: '10:00', close: '18:00' },
			saturday: { closed: false, open: '10:00', close: '18:00' }
		},
		regularHoursStrict: {
			sundayHours: '10:00AM-04:00PM',
			mondayHours: 'CLOSED',
			tuesdayHours: 'CLOSED',
			wednesdayHours: 'CLOSED',
			thursdayHours: 'CLOSED',
			fridayHours: '10:00AM-06:00PM',
			saturdayHours: '10:00AM-06:00PM'
		},
		closedRange: [
			{
				occasion: 'Fall Break',
				startOfBreak: '2026-09-17',
				endOfBreak: '2026-09-18'
			}
		]
	});

	assert.equal(normalized.hours, undefined);
	assert.equal(normalized.regularHoursStrict, undefined);
	assert.equal(normalized.closedRange, undefined);
	assert.equal(normalized.regularHoursRanges.length, 1);
	assert.deepEqual(normalized.regularHoursRanges[0].hours.friday, {
		closed: false,
		open: '10:00',
		close: '18:00'
	});
	assert.deepEqual(normalized.specialHours.at(-1), {
		title: 'Fall Break',
		days: [
			{ date: '2026-09-17', closed: true, open: '', close: '' },
			{ date: '2026-09-18', closed: true, open: '', close: '' }
		]
	});
});
