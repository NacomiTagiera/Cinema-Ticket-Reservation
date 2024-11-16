import type { Genre, MovieStatus } from '@prisma/client';

export interface Movie {
	id: string;
	title: string;
	description: string;
	duration: number;
	genres: Genre[];
	director: string;
	actors: string;
	imageUrl?: string;
	trailerUrl?: string;
	releaseYear: number;
	status: MovieStatus;
}
