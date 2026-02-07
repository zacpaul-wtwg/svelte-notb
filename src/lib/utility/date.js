export const date = function (string) {
	if (!string) return '';
	const value = String(string);
	if (value.includes('T')) {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
	}
	const dateArray = value.split('-');
	if (dateArray.length !== 3) return '';
	return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`;
};

export const formatDateLong = function (string) {
	if (!string) return '';
	const d = new Date(string);
	if (Number.isNaN(d.getTime())) return '';
	return d.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
};

export const formatDateShort = function (string) {
	if (!string) return '';
	const d = new Date(string);
	if (Number.isNaN(d.getTime())) return '';
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
