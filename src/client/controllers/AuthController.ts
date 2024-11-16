import chalk from 'chalk';
import { ApiService } from '../services/ApiService.js';
import { AuthStore } from '../store/AuthStore.js';
import { handleError } from '../utils/errorHandler.js';
import { AuthView } from '../views/AuthView.js';

export class AuthController {
	static async handleLogin(): Promise<void> {
		try {
			const credentials = await AuthView.getLoginCredentials();
			const response = await ApiService.login(credentials);

			const authStore = AuthStore.getInstance();
			authStore.setToken(response.token);

			console.log(chalk.green('Login successful!'));
		} catch (error) {
			handleError(error, 'Login failed');
			await new Promise((resolve) => setTimeout(resolve, 2000)); // give user time to read the error
		}
	}

	static async handleRegister(): Promise<void> {
		try {
			const userData = await AuthView.getRegistrationDetails();
			const response = await ApiService.register(userData);

			const authStore = AuthStore.getInstance();
			authStore.setToken(response.token);

			console.log(chalk.green(response.message));
		} catch (error) {
			handleError(error, 'Registration failed');
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}

	static handleSignOut(): void {
		const authStore = AuthStore.getInstance();
		authStore.clearToken();
		console.log(chalk.green('Successfully signed out!'));
	}
}
