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
}
