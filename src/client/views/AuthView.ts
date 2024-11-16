import chalk from 'chalk';
import inquirer from 'inquirer';
import type { User } from '../models/User.js';

export class AuthView {
	static async getLoginCredentials(): Promise<Omit<User, 'email'>> {
		console.clear();
		console.log(chalk.cyan('--- Login ---'));

		return inquirer.prompt([
			{
				type: 'input',
				name: 'username',
				message: 'Enter your username:',
				validate: (input: string) =>
					input.length >= 3 ? true : 'Username must be at least 3 characters long',
			},
			{
				type: 'password',
				name: 'password',
				message: 'Enter your password:',
			},
		]);
	}

	static async getRegistrationDetails(): Promise<User> {
		console.clear();
		console.log(chalk.cyan('--- Register ---'));

		return inquirer.prompt([
			{
				type: 'input',
				name: 'username',
				message: 'Enter your username:',
				validate: (input: string) =>
					input.length >= 3 ? true : 'Username must be at least 3 characters long',
			},
			{
				type: 'input',
				name: 'email',
				message: 'Enter your email:',
				validate: (input: string) =>
					/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email address',
			},
			{
				type: 'password',
				name: 'password',
				message: 'Enter your password:',
				validate: (input: string) =>
					input.length >= 6 ? true : 'Password must be at least 6 characters long',
			},
		]);
	}
}
