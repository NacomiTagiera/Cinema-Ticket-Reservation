import prisma from '../prisma.js';

export async function finishEndedScreenings(): Promise<void> {
	try {
		const now = new Date();

		await prisma.screening.updateMany({
			where: {
				status: 'ACTIVE',
				endTime: {
					lt: now,
				},
			},
			data: {
				status: 'FINISHED',
			},
		});
	} catch (error) {
		console.error('Failed to finish ended screenings:', error);
	}
}
