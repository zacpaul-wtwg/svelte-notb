export const fallbackAllData = {
	newsPosts: { title: '', date: '', body: '' },
	footerDescription: { body: '' },
	hours: {},
	regularHoursStrict: {
		sundayHours: '',
		mondayHours: '',
		tuesdayHours: '',
		wednesdayHours: '',
		thursdayHours: '',
		fridayHours: '',
		saturdayHours: ''
	},
	faq: [],
	pricing: [],
	specialHours: [],
	// Components assume `[0]` exists in at least one place (BreakRange).
	closedRange: [{ isActive: false }]
};
