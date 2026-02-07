export const formatTimeLabel = function (value) {
	if (!value) return '';
	const [hStr, mStr] = String(value).split(':');
	const h = Number(hStr);
	const m = Number(mStr || '0');
	if (Number.isNaN(h) || Number.isNaN(m)) return '';
	const ap = h >= 12 ? 'PM' : 'AM';
	const hour12 = h % 12 === 0 ? 12 : h % 12;
	const minutes = m ? `:${String(m).padStart(2, '0')}` : '';
	return `${hour12}${minutes} ${ap}`;
};

export const formatDayHours = function (day) {
	if (!day) return '';
	if (day.closed) return 'CLOSED';
	if (!day.open || !day.close) return '';
	return `${formatTimeLabel(day.open)} - ${formatTimeLabel(day.close)}`;
};
