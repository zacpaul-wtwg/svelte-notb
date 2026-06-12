import { postComcashJson } from './getHeaders';

export const getRawProductData = async function () {
	return postComcashJson(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/list',
		{
		offset: 0,
		limit: 3000,
		sort: 'title',
		order: 'asc'
		}
	);
};

export const getSingleProductData = async function (productId) {
	return postComcashJson(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/view',
		{
			productId
		}
	);
};
