import { type Reservation, type ReservedSeat, type Screening } from '@prisma/client';
import { type IBaseRepository } from './IBaseRepository';

export type ReservationWithDetails = Reservation & {
  screening: Screening;
  reservedSeats: ReservedSeat[];
};

export interface IReservationRepository extends IBaseRepository<Reservation> {
  findUserReservations(userId: string): Promise<ReservationWithDetails[]>;
  findPendingReservation(reservationId: string, userId: string): Promise<Reservation | null>;
  findAllReservations(): Promise<ReservationWithDetails[]>;
  createReservationWithSeats(
    userId: string,
    screeningId: string,
    seatIds: string[],
    paymentMethod: 'CASH' | 'CARD',
    totalPrice: number,
    expiresAt: Date
  ): Promise<Reservation>;
  updateReservationStatus(
    reservationId: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
    paymentStatus: 'PAID' | 'UNPAID'
  ): Promise<Reservation>;
}
