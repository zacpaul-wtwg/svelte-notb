export const prerender = true;

export async function load({ fetch }) {
	try {
		const res = await fetch('/data/getAllProducts');
		if (!res.ok) {
			return { things: { products: [], availableFilters: {}, departments: [] } };
		}

		const payload = await res.json();
		return { things: payload?.things ?? { products: [], availableFilters: {}, departments: [] } };
	} catch {
		return { things: { products: [], availableFilters: {}, departments: [] } };
	}
}
