export async function load({ fetch }) {
	const { things } = await fetch('/data/getAllProducts').then((r) => r.json());
	return {
		products: things.products,
		availableFilters: things.availableFilters,
		departments: things.departments
	};
}
