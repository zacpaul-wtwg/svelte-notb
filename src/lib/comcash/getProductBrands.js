import { getHeaders } from './getHeaders';

export const getProductBrands = async function () {
	const requestOptions = {
		method: 'POST',
		headers: await getHeaders()
	};

	return fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/brands',
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => result)
		.catch((error) => console.log('error', error));
};
