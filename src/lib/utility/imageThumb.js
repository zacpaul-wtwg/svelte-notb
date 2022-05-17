export const getThumb = function (image) {
	if (image) {
		return image.replace('pos_', 'thumb_');
	}

	return '/product-placeholder.jpg';
};
