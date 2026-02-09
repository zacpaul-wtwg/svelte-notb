let token;
export const getToken = async function () {
	const openApiKey = process.env.CC_OPEN_API_KEY;
	const pin = process.env.CC_PIN;
	const password = process.env.CC_PASSWORD;

	if (!openApiKey || !pin || !password) {
		throw new Error('Missing Comcash credentials (CC_OPEN_API_KEY, CC_PIN, CC_PASSWORD)');
	}

	const myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');

	const raw = JSON.stringify({
		openApiKey,
		pin,
		password
	});

	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw
	};

	if (token) {
		return token;
	}

	token = await fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/auth/signin',
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => {
			return result;
		})
		.catch((error) => console.log('error', error));

	return token;
};
