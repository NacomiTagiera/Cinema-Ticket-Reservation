export interface Reservation {
	id: string;
	userId: string;
	screeningId: string;
	status: ReservationStatus;
	totalPrice: number;
	paymentStatus: PaymentStatus;
	paymentMethod?: PaymentMethod;
	createdAt: Date;
	updatedAt: Date;
	expiresAt: Date;
}

export interface ReservationRequest {
	screeningId: string;
	seatIds: string[];
	paymentMethod: PaymentMethod;
}

export type CreateReservationResponse = Reservation & {
	screening: {
		startTime: Date;
	};
};

export interface ReservationWithDetails extends Reservation {
	screening: {
		movie: {
			title: string;
		};
		hall: {
			name: string;
		};
		startTime: Date;
	};
	reservedSeats: {
		seat: {
			row: number;
			column: number;
		};
	}[];
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CARD';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'REFUNDED';
