export const loadSchema = function (schema) {
	const newLocal = '<script type="application/ld+json">';
	const newLocal2 = '</script>';
	return newLocal + schema + newLocal2;
};
