export const getProductBrands = async function (token) {
	const myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('Authorization', `Bearer ${token.accessToken}`);

	const requestOptions = {
		method: 'POST',
		headers: myHeaders
	};

	return fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/brands',
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => result)
		.catch((error) => console.log('error', error));
};
