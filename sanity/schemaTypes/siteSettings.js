export default {
	name: 'siteSettings',
	title: 'Site Settings',
	type: 'document',
	fields: [
		{
			name: 'footerDescription',
			title: 'Footer Description',
			type: 'object',
			fields: [
				{ name: 'title', title: 'Title', type: 'string' },
				{ name: 'body', title: 'Body', type: 'text' }
			]
		},
		{
			name: 'hours',
			title: 'Hours',
			type: 'object',
			fields: [
				{ name: 'title', title: 'Title', type: 'string' },
				{ name: 'sunday', title: 'Sunday', type: 'string' },
				{ name: 'monday', title: 'Monday', type: 'string' },
				{ name: 'tuesday', title: 'Tuesday', type: 'string' },
				{ name: 'wednesday', title: 'Wednesday', type: 'string' },
				{ name: 'thursday', title: 'Thursday', type: 'string' },
				{ name: 'friday', title: 'Friday', type: 'string' },
				{ name: 'saturday', title: 'Saturday', type: 'string' },
				{ name: 'areSpecialHoursActive', title: 'Special Hours Active', type: 'boolean' },
				{ name: 'specialHours', title: 'Special Hours (Markdown)', type: 'text' }
			]
		},
		{
			name: 'regularHoursStrict',
			title: 'Regular Hours Strict',
			type: 'object',
			fields: [
				{ name: 'title', title: 'Title', type: 'string' },
				{ name: 'sundayHours', title: 'Sunday Hours', type: 'string' },
				{ name: 'mondayHours', title: 'Monday Hours', type: 'string' },
				{ name: 'tuesdayHours', title: 'Tuesday Hours', type: 'string' },
				{ name: 'wednesdayHours', title: 'Wednesday Hours', type: 'string' },
				{ name: 'thursdayHours', title: 'Thursday Hours', type: 'string' },
				{ name: 'fridayHours', title: 'Friday Hours', type: 'string' },
				{ name: 'saturdayHours', title: 'Saturday Hours', type: 'string' }
			]
		}
	]
};
