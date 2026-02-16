export const cmsSections = [
	{ key: 'hours', label: 'Store Hours', kind: 'object' },
	{ key: 'regularHoursRanges', label: 'Regular Hours Ranges', kind: 'list' },
	{ key: 'specialHours', label: 'Special Hours', kind: 'list' },
	{ key: 'pickupSettings', label: 'Pickup Settings', kind: 'object' },
	{ key: 'newsPosts', label: 'News Post', kind: 'object' },
	{ key: 'pricing', label: 'Pricing', kind: 'list' },
	{ key: 'faq', label: 'FAQ', kind: 'list' },
	{ key: 'footerDescription', label: 'Footer Description', kind: 'object' }
];

export const cmsSectionByKey = Object.fromEntries(cmsSections.map((s) => [s.key, s]));
