const getCategoryById = (categories, categoryId) =>
	categories.find((element) => element.id === parseInt(categoryId, 10))?.title;

const getBrandById = (brands, brandId) =>
	brands.find((element) => element.id === parseInt(brandId, 10))?.title;

const getAttributeByTitle = (array, title) =>
	array?.find((element) => element.title === title)?.value;

const normalizeField = (value, fallback = 'unlisted') => {
	const text = String(value ?? '').trim();
	return text || fallback;
};

const normalizePrice = (value) => Number(Number(value || 0).toFixed(2));

const isTruthyOne = (value) => value === 1 || value === '1' || value === true;

export const isPriceCardEligible = (product) => {
	const value = String(getAttributeByTitle(product?.customAttributes, 'card needed') || '')
		.trim()
		.toLowerCase();
	return value === 'yes';
};

export const isProductListable = (product) =>
	isTruthyOne(product?.isSellableOnWeb) && isTruthyOne(product?.status ?? product?.statusId);

export const mapRawProductListEntry = (categories, brands, product) => {
	const price = normalizePrice(product?.price);
	return {
		id: product?.id,
		barcode: Array.isArray(product?.skuCodes) ? String(product.skuCodes[0] || '').trim() : '',
		title: String(product?.title || ''),
		department: String(getCategoryById(categories, product?.categoryId) || 'FIREWORK'),
		brand: String(getBrandById(brands, product?.brandId) || ''),
		price: price.toFixed(2),
		cardNeeded: isPriceCardEligible(product)
	};
};

export const mapRawProductToPriceCard = (categories, brands, product) => {
	const customAttributes = Array.isArray(product?.customAttributes) ? product.customAttributes : [];
	const price = normalizePrice(product?.price);
	return {
		id: product?.id,
		barcode: Array.isArray(product?.skuCodes) ? String(product.skuCodes[0] || '').trim() : '',
		title: normalizeField(product?.title, 'GENERIC FIREWORK TITLE'),
		department: normalizeField(getCategoryById(categories, product?.categoryId), 'FIREWORK'),
		brand: normalizeField(getBrandById(brands, product?.brandId), ''),
		price: price.toFixed(2),
		singlePrice: (price / 3).toFixed(2),
		desc: normalizeField(getAttributeByTitle(customAttributes, 'description')),
		duration: normalizeField(getAttributeByTitle(customAttributes, 'duration')),
		height: normalizeField(getAttributeByTitle(customAttributes, 'height')),
		shots: normalizeField(getAttributeByTitle(customAttributes, 'shot count')),
		style: normalizeField(getAttributeByTitle(customAttributes, 'type')),
		effects: normalizeField(getAttributeByTitle(customAttributes, 'effects')),
		colors: normalizeField(getAttributeByTitle(customAttributes, 'colors')),
		sounds: normalizeField(getAttributeByTitle(customAttributes, 'sounds')),
		additional: normalizeField(getAttributeByTitle(customAttributes, 'additional'), '')
	};
};
