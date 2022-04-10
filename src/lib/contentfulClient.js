import contentful from 'contentful';

export const client = contentful.createClient({
	// @ts-ignore
	space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
	// @ts-ignore
	accessToken: import.meta.env.VITE_CONTENTFUL_DELIVERY_API_TOKEN
});
