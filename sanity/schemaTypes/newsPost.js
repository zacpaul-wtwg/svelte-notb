export default {
	name: 'newsPost',
	title: 'News Post',
	type: 'document',
	fields: [
		{ name: 'title', title: 'Title', type: 'string' },
		{ name: 'body', title: 'Body', type: 'text' },
		{ name: 'date', title: 'Date', type: 'string' }
	]
};
