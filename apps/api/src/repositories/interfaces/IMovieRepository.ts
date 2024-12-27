import type { Movie, MovieStatus } from '@prisma/client';
import { type IBaseRepository } from './IBaseRepository';

export interface IMovieRepository extends IBaseRepository<Movie> {
	findActiveMovies(): Promise<Movie[]>;
	findMoviesByTitle(title: string): Promise<Movie[]>;
	updateStatus(id: string, status: MovieStatus): Promise<Movie>;
}
