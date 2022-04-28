import { getHeaders } from './getHeaders';

export const getRawProductData = async function () {
	const raw = JSON.stringify({
		offset: 0,
		limit: 3000,
		sort: 'price',
		order: 'desc'
	});

	const requestOptions = {
		method: 'POST',
		headers: await getHeaders(),
		body: raw
	};

	return fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/list',
		requestOptions
	).then((response) => response.json());
};

export const getSingleProductData = async function (productId) {
	var raw = JSON.stringify({
		productId
	});

	var requestOptions = {
		method: 'POST',
		headers: await getHeaders(),
		body: raw
	};

	return fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/view?{{params}}',
		requestOptions
	).then((response) => response.json());
};
