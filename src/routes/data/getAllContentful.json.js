import { getContentfulClient } from '$lib/contentfulClient';
import fs from 'node:fs/promises';
import path from 'node:path';

const readStaticCms = async () => {
	const cmsPath = path.resolve('static', 'cms.json');
	const raw = await fs.readFile(cmsPath, 'utf-8');
	return JSON.parse(raw);
};

export async function get() {
	try {
		const client = getContentfulClient();
		if (!client) {
			try {
				const allData = await readStaticCms();
				return {
					status: 200,
					body: { allData }
				};
			} catch {
				return {
					status: 503,
					body: { error: 'CMS not configured and cms.json missing' }
				};
			}
		}

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
		const regularHoursStrict = await client.getEntries({
			content_type: 'regularHoursStrict'
		});

		const specialHours = await client.getEntries({
			content_type: 'specialHours'
		});

		const faq = await client.getEntries({
			content_type: 'faq'
		});

		const pricing = await client.getEntries({
			content_type: 'pricing'
		});

		const closedRange = await client.getEntries({
			content_type: 'closedRange'
		});

		return {
			status: 200,
			body: {
				allData: {
					newsPosts: newsPosts.items[0].fields,
					footerDescription: footerDescription.items[0].fields,
					hours: hours.items[0].fields,
					regularHoursStrict: regularHoursStrict.items[0].fields,
					faq: faq.items.map((x) => x.fields).sort((a, b) => a.order - b.order),
					pricing: pricing.items.map((x) => x.fields).sort((a, b) => a.order - b.order),
					specialHours: specialHours.items.map((x) => x.fields),
					closedRange: closedRange.items.map((x) => x.fields)
				}
			}
		};
	} catch {
		return {
			status: 404
		};
	}
}
