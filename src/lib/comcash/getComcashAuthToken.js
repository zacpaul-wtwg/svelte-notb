let token;
let tokenPromise;
import { env } from '$env/dynamic/private';

const decodeBase64Value = (value) => {
	if (!value || typeof value !== 'string') return '';
	try {
		return Buffer.from(value, 'base64').toString('utf8').trim();
	} catch {
		return '';
	}
};

const fetchToken = async () => {
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

	const response = await fetch(
		'https://ssl-openapi-northoftheborder.comcash.com/employee/auth/signin',
		requestOptions
	);
	const result = await response.json();
	if (!response.ok || !result?.accessToken) {
		throw new Error(result?.message || 'Comcash signin failed.');
	}
	return result;
};

export const clearToken = () => {
	token = undefined;
	tokenPromise = undefined;
};

export const getToken = async function ({ forceRefresh = false } = {}) {
	if (forceRefresh) {
		clearToken();
	}

	if (token?.accessToken) {
		return token;
	}

	if (!tokenPromise) {
		tokenPromise = fetchToken()
			.then((result) => {
				token = result;
				return result;
			})
			.finally(() => {
				tokenPromise = undefined;
			});
	}

	return tokenPromise;
};
