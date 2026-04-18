import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveHoursForDate } from '../src/lib/cms/hours.js';

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
