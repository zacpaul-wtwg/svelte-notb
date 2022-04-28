import { getToken } from './getComcashAuthToken';

export const getHeaders = async () => {
	const token = await getToken();
	var myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');
	myHeaders.append('Authorization', `Bearer ${token.accessToken}`);
	return myHeaders;
};
