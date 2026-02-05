export const cmsSections = [
	{
		key: 'newsPosts',
		label: 'News Post',
		kind: 'object',
		fields: [
			{ key: 'title', label: 'Title', widget: 'string' },
			{ key: 'date', label: 'Date', widget: 'string' },
			{ key: 'body', label: 'Body', widget: 'text' }
		]
	},
	{
		key: 'footerDescription',
		label: 'Footer Description',
		kind: 'object',
		fields: [
			{ key: 'title', label: 'Title', widget: 'string' },
			{ key: 'body', label: 'Body', widget: 'text' }
		]
	},
	{
		key: 'hours',
		label: 'Store Hours',
		kind: 'object',
		fields: [
			{ key: 'title', label: 'Title', widget: 'string' },
			{ key: 'sunday', label: 'Sunday', widget: 'string' },
			{ key: 'monday', label: 'Monday', widget: 'string' },
			{ key: 'tuesday', label: 'Tuesday', widget: 'string' },
			{ key: 'wednesday', label: 'Wednesday', widget: 'string' },
			{ key: 'thursday', label: 'Thursday', widget: 'string' },
			{ key: 'friday', label: 'Friday', widget: 'string' },
			{ key: 'saturday', label: 'Saturday', widget: 'string' },
			{ key: 'areSpecialHoursActive', label: 'Special Hours Active', widget: 'boolean' },
			{ key: 'specialHours', label: 'Special Hours (Markdown)', widget: 'text', optional: true }
		]
	},
	{
		key: 'regularHoursStrict',
		label: 'Regular Hours Strict',
		kind: 'object',
		fields: [
			{ key: 'title', label: 'Title', widget: 'string' },
			{ key: 'sundayHours', label: 'Sunday Hours', widget: 'string' },
			{ key: 'mondayHours', label: 'Monday Hours', widget: 'string' },
			{ key: 'tuesdayHours', label: 'Tuesday Hours', widget: 'string' },
			{ key: 'wednesdayHours', label: 'Wednesday Hours', widget: 'string' },
			{ key: 'thursdayHours', label: 'Thursday Hours', widget: 'string' },
			{ key: 'fridayHours', label: 'Friday Hours', widget: 'string' },
			{ key: 'saturdayHours', label: 'Saturday Hours', widget: 'string' }
		]
	},
	{
		key: 'faq',
		label: 'FAQ',
		kind: 'list',
		itemLabelKey: 'title',
		fields: [
			{ key: 'title', label: 'Question', widget: 'string' },
			{ key: 'answer', label: 'Answer', widget: 'text' },
			{ key: 'order', label: 'Order', widget: 'number' }
		]
	},
	{
		key: 'pricing',
		label: 'Pricing',
		kind: 'list',
		itemLabelKey: 'title',
		fields: [
			{ key: 'title', label: 'Title', widget: 'string' },
			{ key: 'entry', label: 'Entry', widget: 'text' },
			{ key: 'order', label: 'Order', widget: 'number' }
		]
	},
	{
		key: 'specialHours',
		label: 'Special Hours',
		kind: 'list',
		itemLabelKey: 'occasion',
		fields: [
			{ key: 'occasion', label: 'Occasion', widget: 'string' },
			{ key: 'isActive', label: 'Is Active', widget: 'boolean' },
			{ key: 'dayOneDate', label: 'Day One Date', widget: 'string', optional: true },
			{ key: 'dayOneHours', label: 'Day One Hours', widget: 'string', optional: true },
			{ key: 'dayTwoDate', label: 'Day Two Date', widget: 'string', optional: true },
			{ key: 'dayTwoHours', label: 'Day Two Hours', widget: 'string', optional: true },
			{ key: 'dayThreeDate', label: 'Day Three Date', widget: 'string', optional: true },
			{ key: 'dayThreeHours', label: 'Day Three Hours', widget: 'string', optional: true },
			{ key: 'dayFourDate', label: 'Day Four Date', widget: 'string', optional: true },
			{ key: 'dayFourHours', label: 'Day Four Hours', widget: 'string', optional: true },
			{ key: 'dayFiveDate', label: 'Day Five Date', widget: 'string', optional: true },
			{ key: 'dayFiveHours', label: 'Day Five Hours', widget: 'string', optional: true }
		]
	},
	{
		key: 'closedRange',
		label: 'Closed Range',
		kind: 'list',
		itemLabelKey: 'occasion',
		fields: [
			{ key: 'occasion', label: 'Occasion', widget: 'string' },
			{ key: 'isActive', label: 'Is Active', widget: 'boolean' },
			{ key: 'startOfBreak', label: 'Start of Break', widget: 'string' },
			{ key: 'endOfBreak', label: 'End of Break', widget: 'string' },
			{ key: 'moreInfo', label: 'More Info', widget: 'string' }
		]
	}
];

export const cmsSectionByKey = Object.fromEntries(cmsSections.map((s) => [s.key, s]));

