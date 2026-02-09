let token;
import { env } from '$env/dynamic/private';

const decodeBase64Value = (value) => {
	if (!value || typeof value !== 'string') return '';
	try {
		return Buffer.from(value, 'base64').toString('utf8').trim();
	} catch {
		return '';
	}
};

export const getToken = async function () {
	const openApiKey = env.CC_OPEN_API_KEY;
	const pin = decodeBase64Value(env.CC_PIN_B64);
	const password = env.CC_PASSWORD;

	if (!openApiKey || !pin || !password) {
		throw new Error('Missing Comcash credentials (CC_OPEN_API_KEY, CC_PIN_B64, CC_PASSWORD)');
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
