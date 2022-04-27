export const getProductCategories = async function (token) {
	var myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('Authorization', `Bearer ${token.accessToken}`);

	var requestOptions = {
		method: 'POST',
		headers: myHeaders
	};

	return fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/product/categories',
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => result)
		.catch((error) => console.log('error', error));
};
