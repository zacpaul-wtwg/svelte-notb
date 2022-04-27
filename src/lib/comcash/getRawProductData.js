export const getRawProductData = async function (token) {
	var myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('Authorization', `Bearer ${token.accessToken}`);

	const raw = JSON.stringify({
		offset: 0,
		limit: 3000,
		sort: 'price',
		order: 'desc'
	});

	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw
	};

	return fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/list?session_id={{sessionId}}{{params}}',
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => result)
		.catch((error) => console.log('error', error));
};
