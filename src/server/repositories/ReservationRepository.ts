import type { PaymentMethod, PaymentStatus, Reservation, ReservationStatus } from '@prisma/client';
import prisma from '../prisma.js';
import {
	type IReservationRepository,
	type ReservationWithDetails,
} from './interfaces/IReservationRepository';

export class ReservationRepository implements IReservationRepository {
	async findById(id: string): Promise<Reservation | null> {
		return prisma.reservation.findUnique({
			where: { id },
			include: {
				screening: {
					include: {
						movie: true,
						hall: true,
					},
				},
				reservedSeats: {
					include: {
						seat: true,
					},
				},
				user: {
					select: {
						username: true,
					},
				},
			},
		});
	}

	async create(data: Omit<Reservation, 'id'>): Promise<Reservation> {
		return prisma.reservation.create({
			data,
		});
	}

	async update(id: string, data: Partial<Reservation>): Promise<Reservation> {
		return prisma.reservation.update({
			where: { id },
			data,
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.reservation.delete({
			where: { id },
		});
	}

	async findUserReservations(userId: string): Promise<ReservationWithDetails[]> {
		return prisma.reservation.findMany({
			where: {
				userId,
			},
			include: {
				screening: {
					include: {
						movie: {
							select: {
								title: true,
							},
						},
						hall: {
							select: {
								name: true,
							},
						},
					},
				},
				reservedSeats: {
					include: {
						seat: {
							select: {
								row: true,
								column: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async findAllReservations(): Promise<ReservationWithDetails[]> {
		return prisma.reservation.findMany({
			include: {
				screening: {
					include: {
						movie: {
							select: {
								title: true,
							},
						},
						hall: {
							select: {
								name: true,
							},
						},
					},
				},
				reservedSeats: {
					include: {
						seat: {
							select: {
								row: true,
								column: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async findPendingReservation(reservationId: string, userId: string): Promise<Reservation | null> {
		return prisma.reservation.findFirst({
			where: {
				id: reservationId,
				userId,
				status: 'PENDING',
			},
		});
	}

	async createReservationWithSeats(
		userId: string,
		screeningId: string,
		seatIds: string[],
		paymentMethod: PaymentMethod,
		totalPrice: number,
		expiresAt: Date,
	): Promise<Reservation> {
		return prisma.reservation.create({
			data: {
				userId,
				screeningId,
				totalPrice,
				paymentMethod,
				expiresAt,
				reservedSeats: {
					create: seatIds.map((seatId) => ({
						seatId,
					})),
				},
			},
			include: {
				screening: {
					select: { startTime: true },
				},
			},
		});
	}

	async updateReservationStatus(
		reservationId: string,
		status: ReservationStatus,
		paymentStatus: PaymentStatus,
	): Promise<Reservation> {
		return prisma.reservation.update({
			where: { id: reservationId },
			data: {
				status,
				paymentStatus,
			},
		});
	}
}
