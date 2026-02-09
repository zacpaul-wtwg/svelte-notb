export const prerender = true;

export async function load({ fetch }) {
	let things = {
		products: [],
		availableFilters: {},
		departments: {}
	};

	try {
		const res = await fetch('/data/getAllProducts');
		if (res.ok) {
			const payload = await res.json();
			if (payload?.things?.products) {
				things = payload.things;
			}
		}
	} catch {
		// Keep empty defaults when product data is unavailable.
	}

	return {
		products: things.products,
		availableFilters: things.availableFilters,
		departments: things.departments
	};
}
