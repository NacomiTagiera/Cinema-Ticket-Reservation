import chalk from 'chalk';
import { MenuView } from '../views/MenuView.js';
import { AuthController } from './AuthController.js';

export class MenuController {
	static async showMainMenu(): Promise<void> {
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
				console.log(chalk.yellow('Browse Movies - Coming soon...'));
				break;
			case 'My Reservations':
				console.log(chalk.yellow('My Reservations - Coming soon...'));
				break;
			case 'Exit':
				console.log(chalk.blue('Thank you for visiting!'));
				process.exit(0);
		}

		await this.showMainMenu();
	}
}
