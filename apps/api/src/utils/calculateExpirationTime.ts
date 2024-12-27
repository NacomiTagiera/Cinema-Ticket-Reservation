export const calculateExpirationTime = (screeningStartTime: Date): Date => {
	const now = new Date();
	const timeUntilScreening = screeningStartTime.getTime() - now.getTime();

	const fifteenMinutesInMs = 15 * 60 * 1000;

	if (timeUntilScreening < 30 * 60 * 1000) {
		throw new Error('Cannot make a reservation less than 30 minutes before the screening.');
	}

	const expirationTime = new Date(screeningStartTime.getTime() - fifteenMinutesInMs);

	// If reservation is made very late, ensure at least a 15-minute hold
	return timeUntilScreening <= fifteenMinutesInMs
		? new Date(now.getTime() + fifteenMinutesInMs)
		: expirationTime;
};
