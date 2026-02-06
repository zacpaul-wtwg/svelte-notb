import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getSingleProductData } from '$lib/comcash/getRawProductData';
import { refineProductDetailsData } from '$lib/comcash/refineProductData';

export const prerender = false;

export async function load({ params }) {
	const id = Number(params.id);
	const [productCategories, productBrands, productData] = await Promise.all([
		getProductCategories(),
		getProductBrands(),
		getSingleProductData(id)
	]);

	return {
		product: refineProductDetailsData(productCategories, productBrands, productData)
	};
}
