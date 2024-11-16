export const wait = async (time = 2000) => {
	if (time > 0) {
		await new Promise((resolve) => setTimeout(resolve, time));
	}
};
