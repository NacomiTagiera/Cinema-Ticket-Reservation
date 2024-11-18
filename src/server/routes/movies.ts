import express, { type Request, type Response } from 'express';
import { type JwtPayload } from 'jsonwebtoken';
import { type Seat } from '../../client/models/Seat.js';
import { authenticateToken } from '../middleware/auth.js';
import {
	movieRepository,
	reservationRepository,
	screeningRepository,
} from '../repositories/index.js';
import { calculateExpirationTime } from '../utils/calculateExpirationTime.js';

const router: express.Router = express.Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
	try {
		const movies = await movieRepository.findActiveMovies();
		res.json(movies);
	} catch {
		res.status(500).json({ error: 'Failed to fetch movies' });
	}
});

router.get('/:movieId/screenings', async (req: Request, res: Response): Promise<void> => {
	try {
		const { movieId } = req.params;

		if (!movieId) {
			res.status(400).json({ error: 'Movie ID is required' });
			return;
		}

		const screenings = await screeningRepository.findUpcomingScreeningsForMovie(movieId);
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

			if (!screeningId) {
				res.status(400).json({ error: 'Screening ID is required' });
				return;
			}

			const screening = await screeningRepository.findScreeningWithSeats(screeningId);
			if (!screening) {
				res.status(404).json({ error: 'Screening not found' });
				return;
			}

			const seatsGrid: Seat[][] = [];
			for (let row = 0; row < screening.hall.rows; row++) {
				seatsGrid[row] = [];
				for (let col = 0; col < screening.hall.columns; col++) {
					const seat = screening.hall.seats.find(
						(s: { row: number; column: number }) => s.row === row + 1 && s.column === col + 1,
					);
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

			const screening = await screeningRepository.findById(screeningId);

			if (!screening) {
				res.status(404).json({ error: 'Screening not found' });
				return;
			}

			const expiresAt = calculateExpirationTime(screening.startTime);
			const reservation = await reservationRepository.createReservationWithSeats(
				userId,
				screeningId,
				seatIds,
				paymentMethod,
				0, // Total price will be calculated in the repository
				expiresAt,
			);

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
			const user = req.user as JwtPayload;

			if (!reservationId) {
				res.status(400).json({ error: 'Reservation ID is required' });
				return;
			}

			// For CASH payments, require admin role
			if (paymentMethod === 'CASH' && user.role !== 'ADMIN') {
				res.status(403).json({ error: 'Only admins can confirm cash payments' });
				return;
			}

			const reservation =
				paymentMethod === 'CASH'
					? await reservationRepository.findById(reservationId) // Admins can confirm any reservation
					: await reservationRepository.findPendingReservation(reservationId, user.userId);

			if (!reservation) {
				res.status(404).json({ error: 'Reservation not found' });
				return;
			}

			if (reservation.paymentStatus === 'PAID') {
				res.status(400).json({ error: 'Reservation is already paid' });
				return;
			}

			const updatedReservation = await reservationRepository.updateReservationStatus(
				reservationId,
				'CONFIRMED',
				'PAID',
			);

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
			const reservations = await reservationRepository.findUserReservations(userId);

			res.json(reservations);
		} catch {
			res.status(500).json({ error: 'Failed to fetch reservations' });
		}
	},
);

router.get(
	'/reservations/:id',
	authenticateToken,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { id } = req.params;
			const user = req.user as JwtPayload;

			if (!id) {
				res.status(400).json({ error: 'Reservation ID is required' });
				return;
			}

			// Allow admins to view any reservation
			const reservation = await reservationRepository.findById(id);

			if (!reservation) {
				res.status(404).json({ error: 'Reservation not found' });
				return;
			}

			// Only allow users to view their own reservations unless they're an admin
			if (reservation.userId !== user.userId && user.role !== 'ADMIN') {
				res.status(403).json({ error: 'Unauthorized' });
				return;
			}

			res.json(reservation);
		} catch (error) {
			console.error('Server error:', error);
			res.status(500).json({ error: 'Failed to fetch reservation' });
		}
	},
);

export default router;
