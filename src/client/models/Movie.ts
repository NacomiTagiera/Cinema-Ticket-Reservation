export interface Movie {
	id: string;
	title: string;
	description: string;
	duration: number;
	genres: string[];
	director: string;
	actors: string;
	imageUrl?: string;
	trailerUrl?: string;
	releaseYear: number;
	status: 'ACTIVE' | 'COMING_SOON' | 'ARCHIVED';
}
