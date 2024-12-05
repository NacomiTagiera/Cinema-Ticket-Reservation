import axios from 'axios';
import { type Hall } from '../models/Hall.js';
import { type Movie } from '../models/Movie.js';
import type {
	CreateReservationResponse,
	PaymentMethod,
	ReservationRequest,
	ReservationWithDetails,
} from '../models/Reservation.js';
import type { Screening, ScreeningWithDetails } from '../models/Screening.js';
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

	static async getActiveMovies(): Promise<Movie[]> {
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

	static async createMovie(
		movieData: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>,
	): Promise<Movie> {
		const response = await axios.post(
			`${this.BASE_URL}/admin/movies`,
			movieData,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async getAllMovies(): Promise<Movie[]> {
		const response = await axios.get(`${this.BASE_URL}/admin/movies`, this.getAuthHeader());
		return response.data;
	}

	static async updateMovie(id: string, movieData: Partial<Movie>): Promise<Movie> {
		const response = await axios.put(
			`${this.BASE_URL}/admin/movies/${id}`,
			movieData,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async deleteMovie(id: string): Promise<void> {
		await axios.delete(`${this.BASE_URL}/admin/movies/${id}`, this.getAuthHeader());
	}

	static async getHalls(): Promise<Hall[]> {
		const response = await axios.get(
			`${this.BASE_URL}/admin/screenings/halls`,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async getAvailableHalls(startTime: Date, duration: number): Promise<Hall[]> {
		const response = await axios.get(
			`${this.BASE_URL}/admin/screenings/available-halls?startTime=${startTime.toISOString()}&duration=${duration}`,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async getScreenings(): Promise<ScreeningWithDetails[]> {
		const response = await axios.get(`${this.BASE_URL}/admin/screenings`, this.getAuthHeader());
		return response.data;
	}

	static async createScreening(screeningData: Omit<Screening, 'id'>): Promise<Screening> {
		const response = await axios.post(
			`${this.BASE_URL}/admin/screenings`,
			screeningData,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async updateScreening(id: string, screeningData: Partial<Screening>): Promise<Screening> {
		const response = await axios.put(
			`${this.BASE_URL}/admin/screenings/${id}`,
			screeningData,
			this.getAuthHeader(),
		);
		return response.data;
	}

	static async deleteScreening(id: string): Promise<void> {
		await axios.delete(`${this.BASE_URL}/admin/screenings/${id}`, this.getAuthHeader());
	}

	static async getReservation(id: string): Promise<ReservationWithDetails> {
		try {
			const response = await axios.get(
				`${this.BASE_URL}/movies/reservations/${id}`,
				this.getAuthHeader(),
			);
			return response.data;
		} catch (error) {
			console.error('API Error in getReservation');
			throw error;
		}
	}

	static async confirmCashPayment(reservationId: string): Promise<void> {
		try {
			await axios.post(
				`${this.BASE_URL}/movies/${reservationId}/confirm-payment`,
				{ paymentMethod: 'CASH' },
				this.getAuthHeader(),
			);
		} catch (error) {
			console.error('API Error in confirmCashPayment');
			throw error;
		}
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
