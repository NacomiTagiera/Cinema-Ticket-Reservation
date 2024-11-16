import express from 'express';
import authRoutes from './routes/auth.js';
import moviesRoutes from './routes/movies.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(err.stack);
	const errorMessage = err instanceof Error ? err.message : 'Something went wrong!';
	res.status(500).json({ error: errorMessage });
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
