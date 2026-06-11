import { json } from '@sveltejs/kit';
import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getRawProductData } from '$lib/comcash/getRawProductData';
import { isCmsAdminEnabled, isCmsAdminPasswordValid } from '$lib/server/cmsAdmin';
import {
	isPriceCardEligible,
	isProductListable,
	mapRawProductListEntry
} from '$lib/pricecard/mapPriceCardProduct';

export const prerender = false;

export async function POST({ request }) {
	if (!isCmsAdminEnabled()) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const payload = await request.json().catch(() => ({}));
	if (!isCmsAdminPasswordValid(payload?.password)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const [categories, brands, products] = await Promise.all([
			getProductCategories(),
			getProductBrands(),
			getRawProductData()
		]);

		if (!Array.isArray(products)) {
			return json({ error: 'Comcash product list is unavailable.' }, { status: 502 });
		}

		const items = products
			.filter(isProductListable)
			.filter(isPriceCardEligible)
			.map((product) => mapRawProductListEntry(categories || [], brands || [], product))
			.sort((a, b) => a.title.localeCompare(b.title));

		return json({ items });
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to load price card products.' },
			{ status: 502 }
		);
	}
}
