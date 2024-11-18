import chalk from 'chalk';
import inquirer from 'inquirer';
import { type Hall } from '../models/Hall.js';
import { Genre, MovieStatus, type Movie, type MovieAnswers } from '../models/Movie.js';
import { type ReservationWithDetails } from '../models/Reservation.js';
import {
	ScreeningStatus,
	type Screening,
	type ScreeningAnswers,
	type ScreeningWithDetails,
} from '../models/Screening.js';
import { formatDateTime } from '../utils/formatDateTime.js';
import { validateDateTime } from '../utils/validateDateTime.js';

export class AdminView {
	static async getMovieManagementAction(): Promise<'add' | 'edit' | 'delete' | 'back'> {
		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Choose an action:',
				choices: [
					{ name: 'Add New Movie', value: 'add' },
					{ name: 'Edit Existing Movie', value: 'edit' },
					{ name: 'Delete Movie', value: 'delete' },
					{ name: 'Back to Main Menu', value: 'back' },
				],
			},
		]);

		return answer.action;
	}

	static async getNewMovieDetails(): Promise<Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>> {
		console.clear();
		console.log(chalk.cyan('=== Add New Movie ===\n'));

		const answers = await inquirer.prompt<MovieAnswers>([
			{
				type: 'input',
				name: 'title',
				message: 'Enter movie title:',
				validate: (input) => input.length >= 1 || 'Title is required',
			},
			{
				type: 'input',
				name: 'director',
				message: 'Enter director name:',
				validate: (input) => input.length >= 1 || 'Director is required',
			},
			{
				type: 'number',
				name: 'duration',
				message: 'Enter duration (minutes):',
				validate: (input) => (input && input > 0) || 'Duration must be greater than 0',
			},
			{
				type: 'checkbox',
				name: 'genres',
				message: 'Select genres',
				choices: Object.values(Genre),
				validate: (input) => input.length > 0 || 'Select at least one genre',
			},
			{
				type: 'input',
				name: 'description',
				message: 'Enter movie description:',
				validate: (input) => input.length >= 10 || 'Description must be at least 10 characters',
			},
			{
				type: 'input',
				name: 'actors',
				message: 'Enter actors (comma-separated):',
				validate: (input) => input.length >= 1 || 'Actors are required',
			},
			{
				type: 'number',
				name: 'releaseYear',
				message: 'Enter release year:',
				validate: (input) => {
					const currentYear = new Date().getFullYear();
					return (input && input >= 1888 && input <= currentYear + 5) || 'Invalid release year';
				},
			},
			{
				type: 'list',
				name: 'status',
				message: 'Select movie status:',
				choices: Object.values(MovieStatus),
			},
		]);

		return answers;
	}

	static async getMovieUpdateDetails(movie: Movie): Promise<Partial<Movie>> {
		console.clear();
		console.log(chalk.cyan(`=== Edit Movie: ${movie.title} ===\n`));

		const answers = await inquirer.prompt<Partial<MovieAnswers>>([
			{
				type: 'input',
				name: 'title',
				message: 'Enter movie title:',
				default: movie.title,
				validate: (input) => input.length >= 1 || 'Title is required',
			},
			{
				type: 'input',
				name: 'director',
				message: 'Enter director name:',
				default: movie.director,
				validate: (input) => input.length >= 1 || 'Director is required',
			},
			{
				type: 'number',
				name: 'duration',
				message: 'Enter duration (minutes):',
				default: movie.duration,
				validate: (input) => (input && input > 0) || 'Duration must be greater than 0',
			},
			{
				type: 'checkbox',
				name: 'genres',
				message: 'Select genres',
				choices: Object.values(Genre),
				default: movie.genres,
				validate: (input) => input.length > 0 || 'Select at least one genre',
			},
			{
				type: 'input',
				name: 'description',
				message: 'Enter movie description:',
				default: movie.description,
				validate: (input) => input.length >= 10 || 'Description must be at least 10 characters',
			},
			{
				type: 'input',
				name: 'actors',
				message: 'Enter actors (comma-separated):',
				default: movie.actors,
				validate: (input) => input.length >= 1 || 'Actors are required',
			},
			{
				type: 'number',
				name: 'releaseYear',
				message: 'Enter release year:',
				default: movie.releaseYear,
				validate: (input) => {
					const currentYear = new Date().getFullYear();
					return (input && input >= 1888 && input <= currentYear + 5) || 'Invalid release year';
				},
			},
			{
				type: 'list',
				name: 'status',
				message: 'Select movie status:',
				choices: Object.values(MovieStatus),
				default: movie.status,
			},
		]);

		return Object.fromEntries(Object.entries(answers).filter(([_, value]) => value !== undefined));
	}

	static async selectMovie(movies: Movie[]): Promise<Movie | null> {
		const choices = movies.map((movie) => ({
			name: `${movie.title} (${movie.releaseYear})`,
			value: movie,
		}));

		const { movie } = await inquirer.prompt([
			{
				type: 'list',
				name: 'movie',
				message: 'Select a movie:',
				choices: [...choices, { name: 'Cancel', value: null }],
				pageSize: 10,
			},
		]);

		return movie;
	}

	static async getScreeningManagementAction(): Promise<'add' | 'edit' | 'delete' | 'back'> {
		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Choose an action:',
				choices: [
					{ name: 'Add New Screening', value: 'add' },
					{ name: 'Edit Existing Screening', value: 'edit' },
					{ name: 'Delete Screening', value: 'delete' },
					{ name: 'Back to Main Menu', value: 'back' },
				],
			},
		]);

		return answer.action;
	}

	static async getNewScreeningDetails(movies: Movie[], halls: Hall[]): Promise<ScreeningAnswers> {
		console.clear();
		console.log(chalk.cyan('=== Add New Screening ===\n'));

		const answers = await inquirer.prompt<ScreeningAnswers>([
			{
				type: 'list',
				name: 'movieId',
				message: 'Select movie:',
				choices: movies.map((movie) => ({
					name: `${movie.title} (${movie.duration} min)`,
					value: movie.id,
				})),
			},
			{
				type: 'list',
				name: 'hallId',
				message: 'Select hall:',
				choices: halls.map((hall) => ({
					name: `${hall.name} (${hall.rows}x${hall.columns} seats)`,
					value: hall.id,
				})),
			},
			{
				type: 'input',
				name: 'startTime',
				message: 'Enter screening start time (YYYY-MM-DD HH:mm):',
				validate: validateDateTime,
			},
			{
				type: 'list',
				name: 'status',
				message: 'Select screening status:',
				choices: Object.values(ScreeningStatus),
			},
		]);

		return answers;
	}

	static async selectScreening(
		screenings: ScreeningWithDetails[],
	): Promise<ScreeningWithDetails | null> {
		const { searchTerm } = await inquirer.prompt([
			{
				type: 'input',
				name: 'searchTerm',
				message: 'Search by movie title (press Enter to see all):',
			},
		]);

		const filteredScreenings = searchTerm
			? screenings.filter((screening) =>
					screening.movie.title.toLowerCase().includes(searchTerm.toLowerCase()),
				)
			: screenings;

		if (filteredScreenings.length === 0) {
			console.log(chalk.yellow('\nNo screenings found matching your search.'));
			return null;
		}

		const choices = filteredScreenings.map((screening) => ({
			name: `${screening.movie.title} - ${new Date(screening.startTime).toLocaleString()} (${
				screening.hall.name
			})`,
			value: screening,
		}));

		const { screening } = await inquirer.prompt([
			{
				type: 'list',
				name: 'screening',
				message: 'Select a screening:',
				choices: [...choices, { name: 'Cancel', value: null }],
				pageSize: 10,
			},
		]);

		return screening;
	}

	static async getScreeningUpdateDetails(
		screening: ScreeningWithDetails,
		movies: Movie[],
		halls: Hall[],
	): Promise<Partial<Screening>> {
		console.clear();
		console.log(chalk.cyan(`=== Edit Screening: ${screening.movie.title} ===\n`));

		const answers = await inquirer.prompt([
			{
				type: 'list',
				name: 'movieId',
				message: 'Select movie:',
				choices: movies.map((movie) => ({
					name: `${movie.title} (${movie.duration} min)`,
					value: movie.id,
				})),
				default: screening.movieId,
			},
			{
				type: 'list',
				name: 'hallId',
				message: 'Select hall:',
				choices: halls.map((hall) => ({
					name: `${hall.name} (${hall.rows}x${hall.columns} seats)`,
					value: hall.id,
				})),
				default: screening.hallId,
			},
			{
				type: 'input',
				name: 'startTime',
				message: 'Enter screening start time (YYYY-MM-DD HH:mm):',
				default: formatDateTime(new Date(screening.startTime)),
				validate: validateDateTime,
			},
			{
				type: 'list',
				name: 'status',
				message: 'Select screening status:',
				choices: Object.values(ScreeningStatus),
				default: screening.status,
			},
		]);

		return Object.fromEntries(Object.entries(answers).filter(([_, value]) => value !== undefined));
	}

	static async getReservationId(): Promise<string> {
		const answer = await inquirer.prompt([
			{
				type: 'input',
				name: 'reservationId',
				message: 'Enter reservation ID:',
				validate: (input) => input.length > 0 || 'Reservation ID is required',
			},
		]);

		return answer.reservationId;
	}

	static async confirmDeletion(item: string): Promise<boolean> {
		const { confirm } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'confirm',
				message: `Are you sure you want to delete this ${item}?`,
				default: false,
			},
		]);

		return confirm;
	}

	static async getMainMenuChoice(): Promise<string> {
		console.clear();
		console.log(chalk.cyan('=== Admin Panel ===\n'));

		const { choice } = await inquirer.prompt([
			{
				type: 'list',
				name: 'choice',
				message: 'Choose an option:',
				choices: [
					{ name: 'Manage Movies', value: 'movies' },
					{ name: 'Manage Screenings', value: 'screenings' },
					{ name: 'Manage Cash Payments', value: 'payments' },
					{ name: 'Logout', value: 'logout' },
				],
			},
		]);

		return choice;
	}

	static async confirmPayment(reservation: ReservationWithDetails): Promise<boolean> {
		while (true) {
			console.clear();
			console.log(chalk.cyan('=== Confirm Cash Payment ===\n'));
			console.log('Reservation details:');
			console.log(`Reservation ID: ${chalk.bold(reservation.id)}`);
			console.log(`Movie: ${chalk.bold(reservation.screening.movie.title)}`);
			console.log(
				`Time: ${chalk.bold(new Date(reservation.screening.startTime).toLocaleString())}`,
			);
			console.log(`Hall: ${chalk.bold(reservation.screening.hall.name)}`);
			console.log(`Total amount: ${chalk.bold(`$${Number(reservation.totalPrice).toFixed(2)}`)}`);
			console.log(
				`\nSeats: ${reservation.reservedSeats
					.map(
						(rs: { seat: { row: number; column: number } }) =>
							`Row ${rs.seat.row}, Col ${rs.seat.column}`,
					)
					.join(', ')}`,
			);

			const answer = await inquirer.prompt([
				{
					type: 'list',
					name: 'action',
					message: 'Choose an action:',
					choices: [
						{ name: 'Confirm Payment', value: 'confirm' },
						{ name: 'Cancel', value: 'cancel' },
					],
				},
			]);

			if (answer.action === 'confirm') {
				const confirmAnswer = await inquirer.prompt([
					{
						type: 'confirm',
						name: 'confirm',
						message: 'Are you sure you want to confirm this payment?',
						default: false,
					},
				]);

				if (confirmAnswer.confirm) {
					return true;
				}
			} else if (answer.action === 'cancel') {
				return false;
			}
		}
	}
}
