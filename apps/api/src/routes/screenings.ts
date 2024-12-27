import express, { type Request, type Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { hallRepository, movieRepository, screeningRepository } from '../repositories/index.js';

const router: express.Router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', async (_req: Request, res: Response): Promise<void> => {
	try {
		const screenings = await screeningRepository.findAllWithDetails();
		res.json(screenings);
	} catch {
		res.status(500).json({ error: 'Failed to fetch screenings' });
	}
});

router.get('/halls', async (_req: Request, res: Response): Promise<void> => {
	try {
		const halls = await hallRepository.findAll();
		res.json(halls);
	} catch {
		res.status(500).json({ error: 'Failed to fetch halls' });
	}
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
	try {
		const { movieId, hallId, startTime, status } = req.body;

		if (!movieId || !hallId || !startTime) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		const movie = await movieRepository.findById(movieId);
		if (!movie) {
			res.status(404).json({ error: 'Movie not found' });
			return;
		}

		const hall = await hallRepository.findById(hallId);
		if (!hall) {
			res.status(404).json({ error: 'Hall not found' });
			return;
		}

		const startDateTime = new Date(startTime);
		const endDateTime = new Date(startDateTime.getTime() + movie.duration * 60000);

		const isAvailable = await hallRepository.checkHallAvailability(
			hallId,
			startDateTime,
			endDateTime,
		);

		if (!isAvailable) {
			res.status(400).json({ error: 'This time slot overlaps with existing screenings' });
			return;
		}

		const screening = await screeningRepository.create({
			movieId,
			hallId,
			startTime: startDateTime,
			endTime: endDateTime,
			status: status || 'ACTIVE',
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		res.status(201).json(screening);
	} catch {
		res.status(500).json({ error: 'Failed to create screening' });
	}
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		const { movieId, hallId, startTime, status } = req.body;

		if (!id) {
			res.status(400).json({ error: 'Screening ID is required' });
			return;
		}

		const existingScreening = await screeningRepository.findById(id);
		if (!existingScreening) {
			res.status(404).json({ error: 'Screening not found' });
			return;
		}

		let endTime = existingScreening.endTime;
		if (movieId || startTime) {
			const movie = await movieRepository.findById(movieId || existingScreening.movieId);
			if (!movie) {
				res.status(404).json({ error: 'Movie not found' });
				return;
			}

			const startDateTime = startTime ? new Date(startTime) : existingScreening.startTime;
			endTime = new Date(startDateTime.getTime() + movie.duration * 60000);

			const isAvailable = await hallRepository.checkHallAvailability(
				hallId || existingScreening.hallId,
				startDateTime,
				endTime,
				id,
			);

			if (!isAvailable) {
				res.status(400).json({ error: 'This time slot overlaps with existing screenings' });
				return;
			}
		}

		const screening = await screeningRepository.update(id, {
			movieId,
			hallId,
			startTime: startTime ? new Date(startTime) : undefined,
			endTime,
			status,
		});

		res.json(screening);
	} catch {
		res.status(500).json({ error: 'Failed to update screening' });
	}
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: 'Screening ID is required' });
			return;
		}

		const screening = await screeningRepository.findById(id);
		if (!screening) {
			res.status(404).json({ error: 'Screening not found' });
			return;
		}

		const hasReservations = await screeningRepository.hasReservations(id);
		if (hasReservations) {
			res.status(400).json({ error: 'Cannot delete screening with existing reservations' });
			return;
		}

		await screeningRepository.delete(id);
		res.status(204).send();
	} catch {
		res.status(500).json({ error: 'Failed to delete screening' });
	}
});

router.get('/available-halls', async (req: Request, res: Response): Promise<void> => {
	try {
		const { startTime, duration } = req.query;

		if (!startTime || !duration) {
			res.status(400).json({ error: 'Start time and duration are required' });
			return;
		}

		const startDateTime = new Date(startTime as string);
		const endDateTime = new Date(startDateTime.getTime() + Number(duration) * 60000);
		const halls = await hallRepository.findAll();

		const availableHalls = [];
		for (const hall of halls) {
			const isAvailable = await hallRepository.checkHallAvailability(
				hall.id,
				startDateTime,
				endDateTime,
			);
			if (isAvailable) {
				availableHalls.push(hall);
			}
		}

		res.json(availableHalls);
	} catch {
		res.status(500).json({ error: 'Failed to fetch available halls' });
	}
});

export default router;
