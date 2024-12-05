import { type Hall } from '@prisma/client';
import prisma from '../prisma.js';
import { type IHallRepository } from './interfaces/IHallRepository';

export class HallRepository implements IHallRepository {
	async findAll(): Promise<Hall[]> {
		return prisma.hall.findMany({
			include: {
				seats: {
					include: {
						seatType: true,
					},
				},
			},
		});
	}

	async findById(id: string): Promise<Hall | null> {
		return prisma.hall.findUnique({
			where: { id },
			include: {
				seats: {
					include: {
						seatType: true,
					},
				},
			},
		});
	}

	async checkHallAvailability(
		hallId: string,
		startTime: Date,
		endTime: Date,
		excludeId?: string,
	): Promise<boolean> {
		const conflictingScreenings = await prisma.screening.count({
			where: {
				hallId,
				id: excludeId ? { not: excludeId } : undefined,
				OR: [
					{
						startTime: {
							gte: startTime,
							lt: endTime,
						},
					},
					{
						endTime: {
							gt: startTime,
							lte: endTime,
						},
					},
					{
						AND: [
							{
								startTime: {
									lte: startTime,
								},
							},
							{
								endTime: {
									gte: endTime,
								},
							},
						],
					},
				],
			},
		});

		return conflictingScreenings === 0;
	}
}
