import { postComcashJson } from './getHeaders';

export const getProductBrands = async function () {
	return postComcashJson('https://ssl-openapi-northoftheborder.comcash.com/employee/product/brands');
};
