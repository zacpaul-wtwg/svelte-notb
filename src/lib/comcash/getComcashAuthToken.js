let token;
export const getToken = async function () {
	const myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');

	const raw = JSON.stringify({
		openApiKey: import.meta.env.VITE_CC_OPEN_API_KEY,
		pin: import.meta.env.VITE_CC_PIN,
		password: import.meta.env.VITE_CC_PASSWORD
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
