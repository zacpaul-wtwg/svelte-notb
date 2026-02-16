const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizePrice = (value) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
};

export const normalizeCompareItem = (item) => {
	if (!item || typeof item !== 'object') return null;

	const id = item.id;
	const title = hasText(item.title) ? item.title.trim() : '';
	const imageThumb = hasText(item.imageThumb) ? item.imageThumb.trim() : '';
	const category = hasText(item.category) ? item.category.trim() : 'Uncategorized';
	const deal = hasText(item.deal) ? item.deal.trim() : 'Deal';
	const price = normalizePrice(item.price);
	const colors = Array.isArray(item.colors)
		? item.colors.map((value) => String(value || '').trim()).filter(Boolean)
		: [];
	const effects = Array.isArray(item.effects)
		? item.effects.map((value) => String(value || '').trim()).filter(Boolean)
		: [];
	const shotCount = normalizePrice(item.shotCount);
	const duration = normalizePrice(item.duration);
	const height = normalizePrice(item.height);

	if (!id || !title || price === null) return null;

	return {
		id,
		title,
		price,
		imageThumb,
		category,
		deal,
		colors,
		effects,
		shotCount: shotCount ?? 0,
		duration: duration ?? 0,
		height: height ?? 0
	};
};

export const sanitizeCompareList = (list) => {
	if (!Array.isArray(list)) return [];
	const out = [];
	const seen = new Set();

	for (const raw of list) {
		const normalized = normalizeCompareItem(raw);
		if (!normalized) continue;
		if (seen.has(normalized.id)) continue;
		seen.add(normalized.id);
		out.push(normalized);
	}

	return out;
};
