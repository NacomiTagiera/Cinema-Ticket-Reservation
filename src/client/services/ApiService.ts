import axios from 'axios';
import type { User, UserResponse } from '../models/User.js';

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
}
