import { getToken } from '@lib/comcash/getComcashAuthToken';
import { getProductBrands } from '@lib/comcash/getProductBrands';
import { getProductCategories } from '@lib/comcash/getProductCategories';
import { getRawProductData } from '@lib/comcash/getRawProductData';
import { refineProductData } from '@lib/comcash/refineProductData';

export const fetchProducts = async function () {
	const token = await getToken();
	const [productCategories, productBrands, productData] = await Promise.all([
		getProductCategories(token),
		getProductBrands(token),
		getRawProductData(token),
	]);
		
	return refineProductData(productCategories, productBrands, productData);
};
