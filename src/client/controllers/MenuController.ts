import chalk from 'chalk';
import { MenuView } from '../views/MenuView.js';
import { AuthController } from './AuthController.js';
import { MovieController } from './MovieController.js';

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
					console.log(chalk.yellow('My Reservations - Coming soon...'));
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
