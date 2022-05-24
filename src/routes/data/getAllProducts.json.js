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

	return {
		status: 200,
		body: refineProductIndexData(productCategories, productBrands, productData)
	};
}
