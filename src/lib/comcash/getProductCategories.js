import { postComcashJson } from './getHeaders';

export const getProductCategories = async function () {
	return postComcashJson('https://ssl-openapi-northoftheborder.comcash.com/employee/product/categories');
};
