import { getToken } from '@lib/comcash/getComcashAuthToken';
import { getProductBrands } from '@lib/comcash/getProductBrands';
import { getProductCategories } from '@lib/comcash/getProductCategories';
import { getRawProductData } from '@lib/comcash/getRawProductData';
import { refineProductData } from '@lib/comcash/refineProductData';

export const fetchProducts = function () {
	async function get() {
		const token = await getToken();
		const productCategories = await getProductCategories(token);
		const productBrands = await getProductBrands(token);
		const productData = await getRawProductData(token);
		return await refineProductData(productCategories, productBrands, productData);
	}

	return get();
};
