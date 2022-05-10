import { client } from '$lib/contentfulClient';

export async function get() {
	try {
		//get news items from contentful
		const newsPosts = await client.getEntries({
			content_type: 'newsPost'
		});

		const footerDescription = await client.getEntries({
			content_type: 'footerDescription'
		});
		const hours = await client.getEntries({
			content_type: 'hours'
		});

		return {
			status: 200,
			body: {
				allData: {
					newsPosts: newsPosts.items[0].fields,
					footerDescription: footerDescription.items[0].fields,
					hours: hours.items[0].fields
				}
			}
		};
	} catch {
		return {
			status: 404
		};
	}
}
