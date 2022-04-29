const checkSearchStringMatch = ({ searchableParts }, strings) =>
	strings.every((str) => searchableParts.some((titlePart) => titlePart.startsWith(str)));

const checkForFilterMatch = (product, filters) =>
	filters.every(([productField, matchValues]) =>
		matchValues.every((value) => product[productField]?.includes(value) ?? false)
	);

export const filterProducts = (strings, filters) => (product) =>
	checkSearchStringMatch(product, strings) && checkForFilterMatch(product, filters);
