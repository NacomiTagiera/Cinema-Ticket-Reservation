import type { Movie, MovieStatus } from '@prisma/client';
import prisma from '../prisma.js';
import { type IMovieRepository } from './interfaces/IMovieRepository';

export class MovieRepository implements IMovieRepository {
	async findById(id: string): Promise<Movie | null> {
		return prisma.movie.findUnique({
			where: { id },
		});
	}

	async create(data: Omit<Movie, 'id'>): Promise<Movie> {
		return prisma.movie.create({
			data,
		});
	}

	async update(id: string, data: Partial<Movie>): Promise<Movie> {
		return prisma.movie.update({
			where: { id },
			data,
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.movie.delete({
			where: { id },
		});
	}

	async findAll(): Promise<Movie[]> {
		return prisma.movie.findMany({
			orderBy: {
				title: 'asc',
			},
		});
	}

	async findActiveMovies(): Promise<Movie[]> {
		return prisma.movie.findMany({
			where: {
				status: 'ACTIVE',
			},
			orderBy: {
				title: 'asc',
			},
		});
	}

	async findMoviesByTitle(title: string): Promise<Movie[]> {
		return prisma.movie.findMany({
			where: {
				title: {
					contains: title,
					mode: 'insensitive',
				},
				status: 'ACTIVE',
			},
			orderBy: {
				title: 'asc',
			},
		});
	}

	async updateStatus(id: string, status: MovieStatus): Promise<Movie> {
		return prisma.movie.update({
			where: { id },
			data: { status },
		});
	}
}
