import { type Screening } from '@prisma/client';
import { type ScreeningWithDetails } from '../../client/models/Screening.js';
import prisma from '../prisma.js';
import {
	type IScreeningRepository,
	type ScreeningWithHall,
} from './interfaces/IScreeningRepository';

export class ScreeningRepository implements IScreeningRepository {
	async findById(id: string): Promise<Screening | null> {
		return prisma.screening.findUnique({
			where: { id },
		});
	}

	async create(data: Omit<Screening, 'id'>): Promise<Screening> {
		return prisma.screening.create({
			data,
		});
	}

	async update(id: string, data: Partial<Screening>): Promise<Screening> {
		return prisma.screening.update({
			where: { id },
			data,
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.screening.delete({
			where: { id },
		});
	}

	async findUpcomingScreeningsForMovie(movieId: string): Promise<ScreeningWithHall[]> {
		const now = new Date();
		const cutoffTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

		return prisma.screening.findMany({
			where: {
				movieId,
				startTime: {
					gte: cutoffTime,
				},
			},
			include: {
				hall: {
					include: {
						seats: {
							include: {
								seatType: true,
								reservedSeats: true,
							},
						},
					},
				},
			},
			orderBy: {
				startTime: 'asc',
			},
		});
	}

	async findScreeningWithSeats(screeningId: string): Promise<ScreeningWithHall | null> {
		return prisma.screening.findUnique({
			where: { id: screeningId },
			include: {
				hall: {
					include: {
						seats: {
							include: {
								seatType: true,
								reservedSeats: {
									where: {
										reservation: {
											screeningId,
											status: { not: 'CANCELLED' },
										},
									},
								},
							},
						},
					},
				},
			},
		});
	}

	async findScreeningsInTimeRange(startTime: Date, endTime: Date): Promise<ScreeningWithHall[]> {
		return prisma.screening.findMany({
			where: {
				startTime: { gte: startTime },
				endTime: { lte: endTime },
			},
			include: {
				hall: {
					include: {
						seats: {
							include: {
								seatType: true,
								reservedSeats: true,
							},
						},
					},
				},
			},
			orderBy: {
				startTime: 'asc',
			},
		});
	}

	async findAllWithDetails(): Promise<ScreeningWithDetails[]> {
		const screenings = await prisma.screening.findMany({
			include: {
				movie: true,
				hall: {
					include: {
						seats: {
							include: {
								seatType: true,
								reservedSeats: {
									where: {
										reservation: {
											status: { not: 'CANCELLED' },
										},
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				startTime: 'asc',
			},
		});

		return screenings.map((screening) => ({
			...screening,
			hall: {
				...screening.hall,
				seats: screening.hall.seats.map((seat) => ({
					id: seat.id,
					row: seat.row - 1,
					column: seat.column - 1,
					type: seat.seatType.name,
					price: Number(seat.seatType.price),
					isReserved: seat.reservedSeats.length > 0,
				})),
			},
		}));
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

	async hasReservations(id: string): Promise<boolean> {
		const count = await prisma.reservation.count({
			where: {
				screeningId: id,
				status: { not: 'CANCELLED' },
			},
		});
		return count > 0;
	}
}
