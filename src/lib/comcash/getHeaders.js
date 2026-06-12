import { clearToken, getToken } from './getComcashAuthToken';

export const getHeaders = async () => {
	const token = await getToken();
	var myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('Authorization', `Bearer ${token.accessToken}`);
	return myHeaders;
};

const isComcashErrorEnvelope = (payload) =>
	Boolean(
		payload &&
			typeof payload === 'object' &&
			!Array.isArray(payload) &&
			'errorCode' in payload &&
			'message' in payload
	);

const toComcashError = (payload, fallback) =>
	new Error(
		isComcashErrorEnvelope(payload) ? payload.message || fallback : fallback
	);

export const postComcashJson = async (url, body) => {
	for (let attempt = 0; attempt < 2; attempt += 1) {
		const response = await fetch(url, {
			method: 'POST',
			headers: await getHeaders(),
			...(body === undefined ? {} : { body: JSON.stringify(body) })
		});
		const result = await response.json();

		if (isComcashErrorEnvelope(result) && attempt === 0) {
			clearToken();
			continue;
		}

		if (!response.ok || isComcashErrorEnvelope(result)) {
			throw toComcashError(result, `Comcash request failed (${response.status}).`);
		}

		return result;
	}

	throw new Error('Comcash request failed after refreshing authentication.');
};
