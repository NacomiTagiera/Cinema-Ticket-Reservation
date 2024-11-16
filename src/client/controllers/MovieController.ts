import chalk from 'chalk';
import inquirer from 'inquirer';
import { ApiService } from '../services/ApiService.js';
import { handleError } from '../utils/errorHandler.js';
import { wait } from '../utils/wait.js';
import { MovieView } from '../views/MovieView.js';

export class MovieController {
	static async handleBrowseMovies(): Promise<void> {
		try {
			const movies = await ApiService.getMovies();

			while (true) {
				console.clear();
				const action = await MovieView.getMovieAction(movies);

				if (action === 'back') {
					console.log(chalk.blue('Returning to the main menu...'));
					return;
				}

				const selectedMovie = movies.find((movie) => movie.id === action);
				if (selectedMovie) {
					while (true) {
						MovieView.displayMovieDetails(selectedMovie);
						const detailsAction = await MovieView.getDetailsAction();

						if (detailsAction === 'back') {
							break;
						}

						if (detailsAction === 'screenings') {
							const screenings = await ApiService.getMovieScreenings(selectedMovie.id);
							MovieView.displayScreenings(screenings);
							await inquirer.prompt([
								{
									type: 'list',
									name: 'continue',
									message: 'Choose an action:',
									choices: ['Back to Movie Details'],
								},
							]);
						}
					}
				}
			}
		} catch (error) {
			handleError(error, 'Failed to fetch movies');
			await wait();
			return;
		}
	}
}
