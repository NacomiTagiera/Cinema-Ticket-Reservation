import boxen from 'boxen';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { AuthStore } from '../store/AuthStore.js';

export class MenuView {
	static showWelcomeMessage(): void {
		console.clear();
		console.log(
			boxen(chalk.green('Welcome to the Cinema Ticket Reservation System!'), {
				padding: 1,
				margin: 1,
				borderStyle: 'round',
				borderColor: 'cyan',
			}),
		);
	}

	static async getMainMenuChoice(): Promise<
		| 'Login'
		| 'Register'
		| 'Sign Out'
		| 'Browse Movies'
		| 'My Reservations'
		| 'Manage Movies'
		| 'Manage Screenings'
		| 'Manage Payments'
		| 'Exit'
	> {
		const authStore = AuthStore.getInstance();
		let choices: string[];

		if (!authStore.isAuthenticated) {
			choices = ['Login', 'Register', 'Exit'];
		} else if (authStore.isAdmin) {
			choices = ['Manage Movies', 'Manage Screenings', 'Manage Payments', 'Sign Out', 'Exit'];
		} else {
			choices = ['Browse Movies', 'My Reservations', 'Sign Out', 'Exit'];
		}

		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'mainMenuOption',
				message: 'Please choose an option:',
				choices,
			},
		]);

		return answer.mainMenuOption;
	}
}
