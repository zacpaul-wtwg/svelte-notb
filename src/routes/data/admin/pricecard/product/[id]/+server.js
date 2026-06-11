import { json } from '@sveltejs/kit';
import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getSingleProductData } from '$lib/comcash/getRawProductData';
import { mapRawProductToPriceCard } from '$lib/pricecard/mapPriceCardProduct';
import { isCmsAdminEnabled, isCmsAdminPasswordValid } from '$lib/server/cmsAdmin';

export const prerender = false;

export async function POST({ params, request }) {
	if (!isCmsAdminEnabled()) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const payload = await request.json().catch(() => ({}));
	if (!isCmsAdminPasswordValid(payload?.password)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const id = Number(params.id);
	if (!Number.isFinite(id) || id <= 0) {
		return json({ error: 'Invalid product id.' }, { status: 400 });
	}

	try {
		const [categories, brands, product] = await Promise.all([
			getProductCategories(),
			getProductBrands(),
			getSingleProductData(id)
		]);

		if (!product || typeof product !== 'object' || Array.isArray(product)) {
			return json({ error: 'Comcash product view response was invalid.' }, { status: 502 });
		}

		return json({
			product: mapRawProductToPriceCard(categories || [], brands || [], product)
		});
	} catch (error) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to load price card product.' },
			{ status: 502 }
		);
	}
}
