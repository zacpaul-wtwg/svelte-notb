// @ts-ignore
import { getToken } from '$cc/getComcashAuthToken';
// @ts-ignore
import { getProductBrands } from '$cc/getProductBrands';
// @ts-ignore
import { getProductCategories } from '$cc/getProductCategories';
// @ts-ignore
import { getRawProductData } from '$cc/getRawProductData';
// @ts-ignore
import { refineProductData } from '$cc/refineProductData';

import { writable } from 'svelte/store';

export const productData = writable(false);

export const fetchProducts = async function () {
	const token = await getToken();
	const [productCategories, productBrands, productData] = await Promise.all([
		getProductCategories(token),
		getProductBrands(token),
		getRawProductData(token),
	]);
		
	return refineProductData(productCategories, productBrands, productData);
};
