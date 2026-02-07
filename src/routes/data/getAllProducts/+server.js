import { json } from '@sveltejs/kit';
import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getRawProductData } from '$lib/comcash/getRawProductData';
import { refineProductIndexData } from '$lib/comcash/refineProductData';
import { validateComcashProductList } from '$lib/comcash/validateComcashProduct';

export async function GET() {
	const [productCategories, productBrands, productData] = await Promise.all([
		getProductCategories(),
		getProductBrands(),
		getRawProductData()
	]);

	if (!Array.isArray(productData)) {
		return json(
			{
				error: 'Comcash product list is not an array.',
				details: {
					type: typeof productData,
					keys: productData && typeof productData === 'object' ? Object.keys(productData) : null
				}
			},
			{ status: 502 }
		);
	}

	const validation = validateComcashProductList(productData);
	if (!validation.valid) {
		console.warn('Comcash product list schema validation failed', {
			errorCount: validation.errors.length,
			sample: validation.errors.slice(0, 10)
		});
	}

	const things = refineProductIndexData(productCategories, productBrands, productData);

	return json({
		things,
		...(import.meta.env.DEV
				? {
						debug: {
							rawCount: productData.length,
							refinedCount: things.products.length,
							validation: {
								valid: validation.valid,
								errorCount: validation.errors.length,
								sample: validation.errors.slice(0, 10)
							}
						}
				  }
				: {})
	});
}
