import { getContentfulClient } from '$lib/contentfulClient';
import fs from 'node:fs/promises';
import path from 'node:path';

const readStaticCms = async () => {
	const cmsPath = path.resolve('static', 'cms.json');
	const raw = await fs.readFile(cmsPath, 'utf-8');
	return JSON.parse(raw);
};

const fetchSanityCms = async () => {
	// @ts-ignore
	const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
	// @ts-ignore
	const dataset = import.meta.env.VITE_SANITY_DATASET;
	// @ts-ignore
	const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01';

	if (!projectId || !dataset) return null;

	// GROQ query returns the same shape as the existing allData contract.
	const query = `{
		"newsPosts": *[_type == "newsPost"]|order(date desc)[0]{title, body, date},
		"footerDescription": *[_type == "siteSettings"][0].footerDescription{title, body},
		"hours": *[_type == "siteSettings"][0].hours,
		"regularHoursStrict": *[_type == "siteSettings"][0].regularHoursStrict,
		"faq": *[_type == "faq"]|order(order asc){title, answer, order},
		"pricing": *[_type == "pricing"]|order(order asc){title, entry, order},
		"specialHours": *[_type == "specialHours"]|order(occasion asc){occasion, isActive, dayOneDate, dayOneHours, dayTwoDate, dayTwoHours, dayThreeDate, dayThreeHours, dayFourDate, dayFourHours, dayFiveDate, dayFiveHours},
		"closedRange": *[_type == "closedRange"]|order(startOfBreak desc){occasion, isActive, startOfBreak, endOfBreak, moreInfo}
	}`;

	const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(
		query
	)}`;

	const res = await fetch(url);
	if (!res.ok) return null;
	const json = await res.json();
	return json?.result ?? null;
};

export async function get() {
	try {
		const sanityAllData = await fetchSanityCms();
		if (sanityAllData) {
			return {
				status: 200,
				body: { allData: sanityAllData }
			};
		}

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
