import axios from 'axios';
import { type Movie } from '../models/Movie.js';
import type {
	CreateReservationResponse,
	PaymentMethod,
	ReservationRequest,
	ReservationWithDetails,
} from '../models/Reservation.js';
import { type Screening } from '../models/Screening.js';
import type { Seat } from '../models/Seat.js';
import type { User, UserResponse } from '../models/User.js';
import { AuthStore } from '../store/AuthStore.js';

export class ApiService {
	private static readonly BASE_URL = 'http://localhost:3000/api';

	static async login(credentials: Omit<User, 'email'>): Promise<UserResponse> {
		const response = await axios.post(`${this.BASE_URL}/auth/login`, credentials);
		return response.data;
	}

	static async register(userData: User): Promise<UserResponse> {
		const response = await axios.post(`${this.BASE_URL}/auth/register`, userData);
		return response.data;
	}

	static async getMovies(): Promise<Movie[]> {
		const response = await axios.get(`${this.BASE_URL}/movies`);
		return response.data;
	}

	static async getMovieScreenings(movieId: string): Promise<Screening[]> {
		const response = await axios.get(`${this.BASE_URL}/movies/${movieId}/screenings`);
		return response.data;
	}

	static async getScreeningSeats(screeningId: string): Promise<Seat[][]> {
		const response = await axios.get(
			`${this.BASE_URL}/movies/${screeningId}/seats`,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async createReservation(data: ReservationRequest): Promise<CreateReservationResponse> {
		const response = await axios.post(
			`${this.BASE_URL}/movies/${data.screeningId}/reserve`,
			data,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async getUserReservations(): Promise<ReservationWithDetails[]> {
		const response = await axios.get(`${this.BASE_URL}/movies/reservations`, this.getAuthHeader());
		return response.data;
	}

	static async confirmPayment(reservationId: string, paymentMethod: PaymentMethod): Promise<void> {
		await axios.post(
			`${this.BASE_URL}/movies/${reservationId}/confirm-payment`,
			{ paymentMethod },
			this.getAuthHeader(),
		);
	}

	private static getAuthHeader() {
		const authStore = AuthStore.getInstance();
		return {
			headers: {
				Authorization: `Bearer ${authStore.token}`,
			},
		};
	}
}
