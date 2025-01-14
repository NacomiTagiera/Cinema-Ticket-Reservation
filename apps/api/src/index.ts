import express from 'express';
import { log } from '@repo/logger';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import moviesRoutes from './routes/movies.js';
import screeningsRoutes from './routes/screenings.js';
import { BackgroundJobService } from './services/BackgroundJobService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/screenings', screeningsRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(err.stack);
	const errorMessage = err instanceof Error ? err.message : 'Something went wrong!';
	res.status(500).json({ error: errorMessage });
});

app.listen(PORT, () => {
	log(`Server running on port ${PORT}`);
});

const backgroundJobService = BackgroundJobService.getInstance();
backgroundJobService.start();

process.on('SIGTERM', () => {
	backgroundJobService.stop();
});

process.on('SIGINT', () => {
	backgroundJobService.stop();
});
