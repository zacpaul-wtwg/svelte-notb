export const date = function (string) {
	if (string) {
		const dateArray = string.split('-');
		return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`;
	}
};
