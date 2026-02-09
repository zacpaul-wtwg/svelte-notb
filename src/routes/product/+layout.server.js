export const prerender = true;

export async function load({ fetch }) {
	let things = {
		products: [],
		availableFilters: {},
		departments: []
	};

	try {
		const res = await fetch('/data/getAllProducts');
		if (res.ok) {
			const payload = await res.json();
			if (payload?.things) {
				things = {
					products: Array.isArray(payload.things.products) ? payload.things.products : [],
					availableFilters:
						payload.things.availableFilters && typeof payload.things.availableFilters === 'object'
							? payload.things.availableFilters
							: {},
					departments: Array.isArray(payload.things.departments) ? payload.things.departments : []
				};
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
