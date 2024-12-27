import prisma from '../prisma.js';

export async function cancelExpiredReservations(): Promise<void> {
	try {
		await prisma.reservation.updateMany({
			where: {
				AND: [
					{
						status: 'PENDING',
						expiresAt: {
							lt: new Date(),
						},
					},
				],
			},
			data: {
				status: 'CANCELLED',
			},
		});
	} catch (error) {
		console.error('Failed to cancel expired reservations:', error);
	}
}
