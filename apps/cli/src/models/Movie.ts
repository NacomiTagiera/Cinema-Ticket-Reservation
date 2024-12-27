export interface Movie {
	id: string;
	title: string;
	description: string;
	duration: number;
	genres: GenreType[];
	director: string;
	actors: string;
	imageUrl?: string | null;
	trailerUrl?: string | null;
	releaseYear: number;
	status: MovieStatusType;
}

export interface MovieAnswers {
	title: string;
	director: string;
	duration: number;
	genres: GenreType[];
	description: string;
	actors: string;
	releaseYear: number;
	status: MovieStatusType;
}

type GenreType = `${Genre}`;
type MovieStatusType = `${MovieStatus}`;

export enum MovieStatus {
	ACTIVE = 'ACTIVE',
	COMING_SOON = 'COMING_SOON',
	ARCHIVED = 'ARCHIVED',
}

export enum Genre {
	ACTION = 'ACTION',
	ADVENTURE = 'ADVENTURE',
	COMEDY = 'COMEDY',
	DRAMA = 'DRAMA',
	FANTASY = 'FANTASY',
	HISTORICAL = 'HISTORICAL',
	HORROR = 'HORROR',
	ROMANCE = 'ROMANCE',
	SCIENCE_FICTION = 'SCIENCE_FICTION',
	THRILLER = 'THRILLER',
	WESTERN = 'WESTERN',
}
