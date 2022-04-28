import { getHeaders } from './getHeaders';

export const getProductCategories = async function () {
	var requestOptions = {
		method: 'POST',
		headers: await getHeaders()
	};

	return fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/categories',
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => result)
		.catch((error) => console.log('error', error));
};
