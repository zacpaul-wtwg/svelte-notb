import assert from 'node:assert/strict';
import test from 'node:test';

import {
	PRODUCT_SITE_ORIGIN,
	buildCanonicalProductPath,
	getCanonicalProductUrl
} from '../src/lib/utility/productUrl.js';

test('buildCanonicalProductPath uses the product route shape and slugifies titles', () => {
	assert.equal(
		buildCanonicalProductPath(1234, 'King of Boom!'),
		'/product/1234/king-of-boom'
	);
});

test('getCanonicalProductUrl always uses the production domain', () => {
	assert.equal(
		getCanonicalProductUrl('AB 42', 'Red, White & Boom'),
		`${PRODUCT_SITE_ORIGIN}/product/AB%2042/red-white-and-boom`
	);
});

test('getCanonicalProductUrl falls back to a safe slug when the title is missing', () => {
	assert.equal(getCanonicalProductUrl(77, ''), `${PRODUCT_SITE_ORIGIN}/product/77/77`);
});
