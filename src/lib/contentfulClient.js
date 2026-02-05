import contentful from 'contentful';

export const getContentfulClient = () => {
	// @ts-ignore
	const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
	// @ts-ignore
	const accessToken = import.meta.env.VITE_CONTENTFUL_DELIVERY_API_TOKEN;

	if (!space || !accessToken) {
		return null;
	}

	return contentful.createClient({
		space,
		accessToken
	});
};
