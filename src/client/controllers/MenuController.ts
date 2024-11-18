import chalk from 'chalk';
import { MenuView } from '../views/MenuView.js';
import { AdminController } from './AdminController.js';
import { AuthController } from './AuthController.js';
import { MovieController } from './MovieController.js';
import { ReservationController } from './ReservationController.js';

export class MenuController {
	static async showMainMenu(): Promise<void> {
		try {
			MenuView.showWelcomeMessage();
			const choice = await MenuView.getMainMenuChoice();

			switch (choice) {
				case 'Login':
					await AuthController.handleLogin();
					break;
				case 'Register':
					await AuthController.handleRegister();
					break;
				case 'Sign Out':
					AuthController.handleSignOut();
					break;
				case 'Browse Movies':
					await MovieController.handleBrowseMovies();
					break;
				case 'My Reservations':
					await ReservationController.handleViewReservations();
					break;
				case 'Manage Movies':
					await AdminController.handleManageMovies();
					break;
				case 'Manage Screenings':
					await AdminController.handleManageScreenings();
					break;
				case 'Manage Payments':
					await AdminController.handleManagePayments();
					break;
				case 'Exit':
					console.log(chalk.blue('Thank you for visiting!'));
					process.exit(0);
			}

			await this.showMainMenu();
		} catch (error) {
			if (error instanceof Error && error.message.includes('force closed')) {
				console.log(chalk.red('\nPrompt was force-closed. Returning to main menu...'));
				await this.showMainMenu();
			} else {
				console.error(chalk.red('An unexpected error occurred:'), error);
				process.exit(1);
			}
		}
	}
}
