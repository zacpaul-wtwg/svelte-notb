export const prerender = true;

export async function load({ fetch }) {
	try {
		const res = await fetch('/data/getAllProducts');
		if (!res.ok) {
			return { products: [] };
		}

		const { things } = await res.json();
		return {
			products: things?.products ?? []
		};
	} catch {
		return { products: [] };
	}
}
