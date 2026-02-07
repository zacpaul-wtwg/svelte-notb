import { json } from '@sveltejs/kit';
import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getSingleProductData } from '$lib/comcash/getRawProductData';
import { refineProductDetailsData } from '$lib/comcash/refineProductData';

export async function GET({ params }) {
	const id = Number(params.id);
	if (!Number.isFinite(id) || id <= 0) {
		return json({ error: 'Invalid product id.' }, { status: 400 });
	}

	const [productCategories, productBrands, productData] = await Promise.all([
		getProductCategories(),
		getProductBrands(),
		getSingleProductData(id)
	]);

	if (!productData || typeof productData !== 'object' || Array.isArray(productData)) {
		return json(
			{
				error: 'Comcash product view response was not an object.',
				details: {
					type: typeof productData,
					keys: productData && typeof productData === 'object' ? Object.keys(productData) : null
				}
			},
			{ status: 502 }
		);
	}

	return json({
		product: refineProductDetailsData(productCategories, productBrands, productData)
	});
}
