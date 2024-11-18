import { type Hall } from './Hall';
import { type Movie } from './Movie';

export interface Screening {
	id: string;
	movieId: string;
	hallId: string;
	hallName: string;
	startTime: Date;
	endTime: Date;
	status: ScreeningStatusType;
	createdAt: Date;
	updatedAt: Date;
}

type ScreeningStatusType = `${ScreeningStatus}`;

export enum ScreeningStatus {
	ACTIVE = 'ACTIVE',
	CANCELLED = 'CANCELLED',
	FINISHED = 'FINISHED',
}

export type ScreeningAnswers = Omit<Screening, 'id' | 'hallName' | 'endTime'>;

export interface ScreeningWithDetails extends Omit<Screening, 'hallName'> {
	movie: Movie;
	hall: Hall;
}
