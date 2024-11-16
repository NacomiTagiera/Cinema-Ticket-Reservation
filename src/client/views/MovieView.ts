import chalk from 'chalk';
import inquirer from 'inquirer';
import type { Movie } from '../models/Movie.js';
import { type Screening } from '../models/Screening.js';

export class MovieView {
	static displayMovieDetails(movie: Movie): void {
		console.clear();
		console.log(chalk.cyan(`=== ${movie.title} ===\n`));
		console.log(chalk.yellow('Details:'));
		console.log(`Director: ${movie.director}`);
		console.log(`Duration: ${movie.duration} minutes`);
		console.log(`Genres: ${movie.genres.join(', ')}`);
		console.log(`Year: ${movie.releaseYear}`);
		console.log(`Cast: ${movie.actors}`);
		console.log('\nDescription:');
		console.log(chalk.gray(movie.description));
		console.log('\n' + '-'.repeat(50) + '\n');
	}

	static async getMovieAction(movies: Movie[]): Promise<'back' | string> {
		const choices = [
			...movies.map((movie) => ({
				name: `${movie.title} (${movie.genres.join(', ')})`,
				value: movie.id,
			})),
			new inquirer.Separator(),
			{ name: 'Back to Main Menu', value: 'back' },
		];

		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Select a movie to see details or go back:',
				choices,
				pageSize: 10,
			},
		]);

		return answer.action;
	}

	static displayScreenings(screenings: Screening[]): void {
		console.log(chalk.cyan('\nUpcoming Screenings:'));

		if (screenings.length === 0) {
			console.log(chalk.yellow('No upcoming screenings available.'));
			return;
		}

		screenings.forEach((screening) => {
			const date = new Date(screening.startTime);
			console.log(chalk.white(`\n📅 ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`));
			console.log(`🎬 Hall: ${screening.hallName}`);
		});
	}

	static async getDetailsAction(): Promise<'screenings' | 'back'> {
		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Choose an action:',
				choices: [
					{ name: 'View Screenings', value: 'screenings' },
					{ name: 'Back to Movies List', value: 'back' },
				],
			},
		]);

		return answer.action;
	}
}
