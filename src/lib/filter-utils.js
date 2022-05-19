//function checks an array(list) of input values against an array(list)
//created from the words in the product title
const checkSearchStringMatch = function ({ searchableParts }, strings) {
	//compares every string/value in the input array against the title array, looking for a boolean
	//we wouldn't need the .every() if we didn't care about checking against multiple strings
	//from the input field
	return strings.every(function (str) {
		//checks if one item from the title array matches the current input array, if so return true
		return searchableParts.some(function (titlePart) {
			//if the item in the title array starts with the string, return true
			return titlePart.startsWith(str);
		});
	});
};

//this checks that all the selected filters from the checkbox area match the criteria,
//if one fails then it all fails, and the product is excluded from the final array
const checkForFilterMatch = (product, filters) =>
	filters.every(([productField, matchValues]) =>
		matchValues.every((value) => product[productField]?.includes(value) ?? false)
	);

//my function and explanation:
//to make a new function that accepts a value from a <select /> html element
//we create a binding on the <select /> so that it is continuously updating the information
//that gets passed to our new function, call it 'checkDealMatch()'
//there is no ambiguity in the check, the function will receive either a string of '2 FOR' or '3 FOR'
//if the current product deal matches, then we return true, if not, false
//a simple conditional statement here should do the trick
//we also want to make a condition where the user can see all items regardless of pricing, by default
//the value is 'All Pricing', so if('All Pricing') return true
const checkPricingMatch = function ({ deal }, option) {
	if (option === 'ALL PRICING') {
		return true;
	}
	return deal === option;
};

const checkDepartmentMatch = function ({ category }, option) {
	if (option === 'ALL DEPARTMENTS') {
		return true;
	}
	return category === option;
};

//the final function here takes the functions in this file and requires that all tests return true
//if both are true then we pass a boolean: true to the filter method on the product page
//which in turn includes the product in the new products array, the $: makes this
//a reactive statement and therefore re-renders the page
export const filterProducts = (strings, filters, pricing, department) => (product) =>
	checkSearchStringMatch(product, strings) &&
	checkForFilterMatch(product, filters) &&
	checkPricingMatch(product, pricing) &&
	checkDepartmentMatch(product, department);

//sorting functions go below
export const sortProducts = function (filteredProducts, sortMethod) {
	const value = {
		title: { option: 'title', a: 1, b: -1 },
		lowestPriceFirst: { option: 'price', a: 1, b: -1 },
		highestPriceFirst: { option: 'price', a: -1, b: 1 },
		newestFirst: { option: 'id', a: -1, b: 1 },
		oldestFirst: { option: 'id', a: 1, b: -1 }
	}[sortMethod];

	return filteredProducts.sort((a, b) => (a[value.option] > b[value.option] ? value.a : value.b));
};
