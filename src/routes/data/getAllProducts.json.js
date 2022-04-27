import { getToken } from '$lib/comcash/getComcashAuthToken';
import { getProductBrands } from '$lib/comcash/getProductBrands';
import { getProductCategories } from '$lib/comcash/getProductCategories';
import { getRawProductData } from '$lib/comcash/getRawProductData';
import { refineProductData } from '$lib/comcash/refineProductData';

export async function get() {
	const token = await getToken();
	const productCategories = await getProductCategories(token);
	const productBrands = await getProductBrands(token);
	const productData = await getRawProductData(token);
	const products = await refineProductData(productCategories, productBrands, productData);

	return {
		status: 200,
		body: {
			products
		}
	};
}
