export const validateDateTime = (input: string): boolean | string => {
	if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(input)) {
		return 'Invalid format. Please use YYYY-MM-DD HH:mm';
	}

	const date = new Date(input.replace(' ', 'T'));

	if (isNaN(date.getTime())) {
		return 'Invalid date';
	}

	const now = new Date();
	if (date <= now) {
		return 'Start time must be in the future';
	}

	// Check if minutes are in 5-minute intervals
	if (date.getMinutes() % 5 !== 0) {
		return 'Time must be in 5-minute intervals';
	}

	return true;
};
