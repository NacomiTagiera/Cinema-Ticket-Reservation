import express, { type Request, type Response } from 'express';
import prisma from '../prisma.js';

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
		const screenings = await prisma.screening.findMany({
			where: {
				movieId,
				startTime: {
					gte: new Date(),
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

export default router;
