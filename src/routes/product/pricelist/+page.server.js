export async function load({ fetch }) {
	const { things } = await fetch('/data/getAllProducts').then((results) => results.json());
	return { things };
}
