export const getDealDivisor = (deal) => {
	if (typeof deal === 'number' && Number.isFinite(deal) && deal > 0) return deal;
	const text = String(deal || '')
		.trim()
		.toUpperCase();
	if (text.includes('2 FOR')) return 2;
	if (text.includes('3 FOR')) return 3;
	const parsed = Number(text);
	if (Number.isFinite(parsed) && parsed > 0) return parsed;
	return 1;
};

export const formatDealLabel = (deal) => {
	const text = String(deal ?? '').trim();
	if (!text) return '-';
	const normalized = text.toUpperCase().replace(/\s+/g, ' ');
	const directNumber = Number(normalized);
	if (Number.isFinite(directNumber) && directNumber > 0) {
		return `${directNumber} FOR`;
	}
	const forMatch = normalized.match(/^(\d+)\s*FOR(?:\s*1)?$/);
	if (forMatch) return `${forMatch[1]} FOR`;
	return normalized;
};
