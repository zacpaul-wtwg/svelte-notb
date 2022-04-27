export const refineProductData = function (categories, brands, products) {
	//find the title for the category associated with the categoryId
	const getCategoryById = function (categoryId) {
		return categories.find(function (element) {
			return element.id === parseInt(categoryId);
		})?.title;
	};
	//find the title for the brand associated with the brandId
	const getBrandById = function (brandId) {
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

	return (
		products
			//get only items that are active, these are items with a statusId ===1
			// .filter(function (product) {
			// 	return product.statusId === '1';
			// })
			.filter(function (product) {
				return product.isSellableOnWeb === 1;
			})
			.map(function (element) {
				return {
					//add ID
					id: element.id,
					imageThumb: element.imageUrl,
					title: element.title,
					price: element.price,
					category: getCategoryById(element.categoryId),
					brand: getBrandById(element.brandId),
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
			})
	);
};
