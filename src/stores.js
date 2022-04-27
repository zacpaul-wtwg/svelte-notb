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
