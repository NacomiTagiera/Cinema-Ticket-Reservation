import express, { type Request, type Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { movieRepository } from '../repositories/index.js';

const router: express.Router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/movies', async (_req: Request, res: Response): Promise<void> => {
	try {
		const movies = await movieRepository.findAll();
		res.json(movies);
	} catch {
		res.status(500).json({ error: 'Failed to fetch movies' });
	}
});

router.post('/movies', async (req: Request, res: Response): Promise<void> => {
	try {
		const movieData = req.body;
		const movie = await movieRepository.create(movieData);
		res.status(201).json(movie);
	} catch {
		res.status(500).json({ error: 'Failed to create movie' });
	}
});

router.put('/movies/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: 'Movie ID is required' });
			return;
		}

		const movieData = req.body;
		const movie = await movieRepository.update(id, movieData);
		res.json(movie);
	} catch {
		res.status(500).json({ error: 'Failed to update movie' });
	}
});

router.delete('/movies/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: 'Movie ID is required' });
			return;
		}

		await movieRepository.delete(id);
		res.status(204).send();
	} catch {
		res.status(500).json({ error: 'Failed to delete movie' });
	}
});

export default router;
