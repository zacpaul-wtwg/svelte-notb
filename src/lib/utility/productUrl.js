import { slugify } from './slugify.js';

export const PRODUCT_SITE_ORIGIN = 'https://www.notbfireworks.com';

export const buildCanonicalProductPath = (id, title = '') => {
	const productId = String(id ?? '').trim();
	const slug = slugify(String(title || productId || 'product'));
	return `/product/${encodeURIComponent(productId)}/${slug || 'product'}`;
};

export const getCanonicalProductUrl = (id, title = '') =>
	new URL(buildCanonicalProductPath(id, title), PRODUCT_SITE_ORIGIN).toString();
