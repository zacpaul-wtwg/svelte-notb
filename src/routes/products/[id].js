import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getSingleProductData } from '$lib/comcash/getRawProductData';
import { refineProductDetailsData } from '$lib/comcash/refineProductData';

export async function get({ params }) {
	const id = Number(params.id);
	const [productCategories, productBrands, productData] = await Promise.all([
		getProductCategories(),
		getProductBrands(),
		getSingleProductData(id)
	]);

	return {
		status: 200,
		body: {
			product: refineProductDetailsData(productCategories, productBrands, productData)
		}
	};
}
