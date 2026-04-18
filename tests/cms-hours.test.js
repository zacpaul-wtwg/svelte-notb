import test from 'node:test';
import assert from 'node:assert/strict';
import { getHoursCoverageSummary, resolveHoursForDate } from '../src/lib/cms/hours.js';

const cms = {
	regularHoursRanges: [
		{
			startDate: '2026-01-01',
			endDate: '2026-12-31',
			hours: {
				sunday: { closed: true, open: '', close: '' },
				monday: { closed: true, open: '', close: '' },
				tuesday: { closed: true, open: '', close: '' },
				wednesday: { closed: true, open: '', close: '' },
				thursday: { closed: true, open: '', close: '' },
				friday: { closed: false, open: '10:00', close: '18:00' },
				saturday: { closed: false, open: '10:00', close: '18:00' }
			}
		}
	],
	specialHours: [
		{
			title: 'Holiday',
			days: [{ date: '2026-07-03', closed: false, open: '09:00', close: '21:00' }]
		}
	]
};

test('resolveHoursForDate uses dated special hours over regular ranges', () => {
	assert.deepEqual(resolveHoursForDate(cms, '2026-07-03'), {
		source: 'special',
		hours: { closed: false, open: '09:00', close: '21:00' }
	});
});

test('resolveHoursForDate falls back to matching regular range by weekday', () => {
	assert.deepEqual(resolveHoursForDate(cms, '2026-04-17'), {
		source: 'regularRange',
		hours: { closed: false, open: '10:00', close: '18:00' }
	});
});

test('resolveHoursForDate returns closed entries when a date is closed', () => {
	assert.deepEqual(resolveHoursForDate(cms, '2026-04-16'), {
		source: 'regularRange',
		hours: { closed: true, open: '', close: '' }
	});
});

test('resolveHoursForDate treats invalid entries as unavailable', () => {
	const invalidCms = {
		regularHoursRanges: [
			{
				startDate: '2026-01-01',
				endDate: '2026-12-31',
				hours: {
					sunday: { closed: true, open: '', close: '' },
					monday: { closed: true, open: '', close: '' },
					tuesday: { closed: true, open: '', close: '' },
					wednesday: { closed: true, open: '', close: '' },
					thursday: { closed: true, open: '', close: '' },
					friday: { closed: false, open: '10am', close: '18:00' },
					saturday: { closed: false, open: '10:00', close: '18:00' }
				}
			}
		]
	};

	assert.deepEqual(resolveHoursForDate(invalidCms, '2026-04-17'), {
		source: 'regularRange',
		hours: null
	});
});

test('resolveHoursForDate returns none when no range matches', () => {
	assert.deepEqual(resolveHoursForDate({ regularHoursRanges: [] }, '2026-04-17'), {
		source: 'none',
		hours: null
	});
});

test('getHoursCoverageSummary marks expired regular ranges as uncovered today', () => {
	const summary = getHoursCoverageSummary(cms, {
		dateValue: '2027-01-01',
		maxDaysOut: 7
	});

	assert.equal(summary.rangeState, 'expired');
	assert.equal(summary.todayCovered, false);
	assert.equal(summary.firstUncoveredDate, '2027-01-01');
	assert.equal(summary.latestRange?.endDate, '2026-12-31');
});

test('getHoursCoverageSummary flags the first uncovered date inside the pickup window', () => {
	const summary = getHoursCoverageSummary(cms, {
		dateValue: '2026-12-29',
		maxDaysOut: 5
	});

	assert.equal(summary.rangeState, 'active');
	assert.equal(summary.todayCovered, true);
	assert.equal(summary.firstUncoveredDate, '2027-01-01');
	assert.equal(summary.windowEndDate, '2027-01-03');
});
