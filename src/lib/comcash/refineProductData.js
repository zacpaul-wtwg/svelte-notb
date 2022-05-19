//find the title for the category associated with the categoryId
const getCategoryById = function (categories, categoryId) {
	return categories.find(function (element) {
		return element.id === parseInt(categoryId);
	})?.title;
};
//find the title for the brand associated with the brandId
const getBrandById = function (brands, brandId) {
	return brands.find(function (element) {
		return element.id === parseInt(brandId);
	})?.title;
};
//get the value for the custom attrubute title
const getAttributeByTitle = function (array, title) {
	return array.find(function (element) {
		return element.title === title;
	})?.value;
};
const badValues = [' ', 'undefined'];
const getAttributeArrayByTitle = function (array, title) {
	return (
		getAttributeByTitle(array, title)
			?.split(' ')
			?.filter((v) => !badValues.includes(v)) ?? []
	);
};
//get the unique attributes of the full list from the product dump
// const getUniqueAttributes = function (string) {
// 	const set = string
// 		.toLowerCase()
// 		.replace('  ', ' ')
// 		.split(' ')
// 		.filter((v) => v != ' ');
// 	return [...new Set(set)].sort();
// };

export const refineProductIndexData = function (categories, brands, products) {
	let allAffects = new Set();
	let allColors = new Set();
	let allSounds = new Set();
	let allDepartments = new Set();
	let productsFinal = [];

	products
		//get only items that are active, these are items with a isSellableOnWeb === 1
		.filter(function (product) {
			return product.isSellableOnWeb === 1;
		})
		.filter(function (product) {
			return product.status === '1';
		})
		.forEach(function (element) {
			getAttributeArrayByTitle(element.customAttributes, 'effects').forEach((v) =>
				allAffects.add(v)
			);
			getAttributeArrayByTitle(element.customAttributes, 'colors').forEach((v) => allColors.add(v));
			getAttributeArrayByTitle(element.customAttributes, 'sounds').forEach((v) => allSounds.add(v));
			allDepartments.add(getCategoryById(categories, element.categoryId));
			productsFinal.push({
				id: element.id,
				imageThumb: element.imageUrl,
				title: element.title,
				price: Number(element.price),
				category: getCategoryById(categories, element.categoryId),
				deal: getBrandById(brands, element.brandId),
				description: getAttributeByTitle(element.customAttributes, 'description'),
				featured: getAttributeByTitle(element.customAttributes, 'featured'),
				effects: getAttributeArrayByTitle(element.customAttributes, 'effects'),
				colors: getAttributeArrayByTitle(element.customAttributes, 'colors'),
				sounds: getAttributeArrayByTitle(element.customAttributes, 'sounds'),
				searchableParts: element.title?.toLowerCase()?.split(' ') ?? []
			});
		});

	const availableFilters = {
		colors: [...allColors],
		sounds: [...allSounds],
		effects: [...allAffects]
	};

	const departments = [...allDepartments];

	return { products: productsFinal, availableFilters, departments };
};

export const refineProductDetailsData = function (categories, brands, element) {
	//console.log({ element });
	return {
		id: element.id,
		images: element.images,
		title: element.title,
		price: element.price,
		category: getCategoryById(categories, element.categoryId),
		brand: getBrandById(brands, element.brandId),
		description: getAttributeByTitle(element.customAttributes, 'description'),
		featured: getAttributeByTitle(element.customAttributes, 'featured'),
		duration: getAttributeByTitle(element.customAttributes, 'duration'),
		type: getAttributeByTitle(element.customAttributes, 'type'),
		shotCount: getAttributeByTitle(element.customAttributes, 'shot count'),
		effects: getAttributeByTitle(element.customAttributes, 'effects'),
		colors: getAttributeByTitle(element.customAttributes, 'colors'),
		sounds: getAttributeByTitle(element.customAttributes, 'sounds'),
		height: getAttributeByTitle(element.customAttributes, 'height'),
		youtubeId: getAttributeByTitle(element.customAttributes, 'youtube')
	};
};
