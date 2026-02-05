import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getRawProductData } from '$lib/comcash/getRawProductData';
import { refineProductIndexData } from '$lib/comcash/refineProductData';

export async function get() {
	const [productCategories, productBrands, productData] = await Promise.all([
		getProductCategories(),
		getProductBrands(),
		getRawProductData()
	]);

	if (!Array.isArray(productData)) {
		return {
			status: 502,
			body: {
				error: 'Comcash product list is not an array.',
				details: {
					type: typeof productData,
					keys: productData && typeof productData === 'object' ? Object.keys(productData) : null
				}
			}
		};
	}

	const things = refineProductIndexData(productCategories, productBrands, productData);

	return {
		status: 200,
		body: {
			things,
			// Light debug info in dev only to help diagnose empty product lists.
			...(import.meta.env.DEV
				? {
						debug: {
							rawCount: productData.length,
							refinedCount: things.products.length
						}
				  }
				: {})
		}
	};
}
