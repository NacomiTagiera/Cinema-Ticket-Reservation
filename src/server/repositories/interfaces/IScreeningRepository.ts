import { type Screening, type Hall, type Seat, type SeatType, type ReservedSeat } from '@prisma/client';
import { type IBaseRepository } from './IBaseRepository';

export type HallWithSeats = Hall & {
	seats: (Seat & {
		seatType: SeatType;
		reservedSeats: ReservedSeat[];
	})[];
};

export type ScreeningWithHall = Screening & {
	hall: HallWithSeats;
};

export interface IScreeningRepository extends IBaseRepository<Screening> {
	findUpcomingScreeningsForMovie(movieId: string): Promise<ScreeningWithHall[]>;
	findScreeningWithSeats(screeningId: string): Promise<ScreeningWithHall | null>;
	findScreeningsInTimeRange(startTime: Date, endTime: Date): Promise<ScreeningWithHall[]>;
	checkHallAvailability(hallId: string, startTime: Date, endTime: Date): Promise<boolean>;
}
