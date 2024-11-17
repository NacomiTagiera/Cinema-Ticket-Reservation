import express, { type Request, type Response } from 'express';
import { type JwtPayload } from 'jsonwebtoken';
import { type Seat } from '../../client/models/Seat.js';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../prisma.js';
import { calculateExpirationTime } from '../utils/calculateExpirationTime.js';

const router: express.Router = express.Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
	try {
		const movies = await prisma.movie.findMany({
			where: {
				status: 'ACTIVE',
			},
			orderBy: {
				title: 'asc',
			},
		});

		res.json(movies);
	} catch {
		res.status(500).json({ error: 'Failed to fetch movies' });
	}
});

router.get('/:movieId/screenings', async (req: Request, res: Response): Promise<void> => {
	try {
		const { movieId } = req.params;

		const now = new Date();
		const cutoffTime = new Date(now.getTime() + 30 * 60 * 1000);

		const screenings = await prisma.screening.findMany({
			where: {
				movieId,
				startTime: {
					gte: cutoffTime,
				},
			},
			include: {
				hall: true,
			},
			orderBy: {
				startTime: 'asc',
			},
		});

		const formattedScreenings = screenings.map((screening) => ({
			id: screening.id,
			movieId: screening.movieId,
			hallId: screening.hallId,
			hallName: screening.hall.name,
			startTime: screening.startTime,
			endTime: screening.endTime,
		}));

		res.json(formattedScreenings);
	} catch {
		res.status(500).json({ error: 'Failed to fetch screenings' });
	}
});

router.get(
	'/:screeningId/seats',
	authenticateToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { screeningId } = req.params;

			const screening = await prisma.screening.findUnique({
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

			if (!screening) {
				res.status(404).json({ error: 'Screening not found' });
				return;
			}

			const seatsGrid: Seat[][] = [];
			for (let row = 0; row < screening.hall.rows; row++) {
				seatsGrid[row] = [];
				for (let col = 0; col < screening.hall.columns; col++) {
					const seat = screening.hall.seats.find((s) => s.row === row + 1 && s.column === col + 1);
					if (seat) {
						seatsGrid[row]![col] = {
							id: seat.id,
							row: seat.row - 1,
							column: seat.column - 1,
							type: seat.seatType.name,
							price: Number(seat.seatType.price),
							isReserved: seat.reservedSeats.length > 0,
						};
					}
				}
			}

			res.json(seatsGrid);
		} catch {
			res.status(500).json({ error: 'Failed to fetch seats' });
		}
	},
);

router.post(
	'/:screeningId/reserve',
	authenticateToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { screeningId } = req.params;
			const { seatIds, paymentMethod } = req.body;
			const userId = (req.user as JwtPayload).userId as string;

			if (!screeningId) {
				res.status(400).json({ error: 'Screening ID is required' });
				return;
			}

			if (!Array.isArray(seatIds) || !seatIds.length) {
				res.status(400).json({ error: 'Seat IDs are required and must be an array' });
				return;
			}

			if (!['CASH', 'CARD'].includes(paymentMethod)) {
				res.status(400).json({ error: 'Invalid payment method' });
				return;
			}

			const screening = await prisma.screening.findUnique({
				where: { id: screeningId },
				select: { startTime: true },
			});

			if (!screening) {
				res.status(404).json({ error: 'Screening not found' });
				return;
			}

			const seats = await prisma.seat.findMany({
				where: { id: { in: seatIds } },
				include: { seatType: true },
			});

			const totalPrice = seats.reduce((sum, seat) => sum + Number(seat.seatType.price), 0);
			const expiresAt = calculateExpirationTime(screening.startTime);

			const reservation = await prisma.reservation.create({
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

			res.json(reservation);
		} catch {
			res.status(500).json({ error: 'Failed to create reservation' });
		}
	},
);

router.post(
	'/:reservationId/confirm-payment',
	authenticateToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { reservationId } = req.params;
			const { paymentMethod } = req.body;
			const userId = (req.user as JwtPayload).userId as string;

			const reservation = await prisma.reservation.findFirst({
				where: {
					id: reservationId,
					userId,
					status: 'PENDING',
				},
			});

			if (!reservation) {
				res.status(404).json({ error: 'Reservation not found' });
				return;
			}

			const status = paymentMethod === 'CARD' ? 'CONFIRMED' : 'PENDING';
			const paymentStatus = paymentMethod === 'CARD' ? 'PAID' : 'UNPAID';

			const updatedReservation = await prisma.reservation.update({
				where: { id: reservationId },
				data: {
					status,
					paymentStatus,
					paymentMethod,
				},
			});

			res.json(updatedReservation);
		} catch {
			res.status(500).json({ error: 'Failed to confirm payment' });
		}
	},
);

router.get(
	'/reservations',
	authenticateToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userId = (req.user as JwtPayload).userId as string;

			const reservations = await prisma.reservation.findMany({
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

			res.json(reservations);
		} catch {
			res.status(500).json({ error: 'Failed to fetch reservations' });
		}
	},
);

export default router;
