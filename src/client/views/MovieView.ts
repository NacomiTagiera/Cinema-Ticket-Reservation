import chalk from 'chalk';
import inquirer from 'inquirer';
import type { Movie } from '../models/Movie.js';
import { type PaymentMethod } from '../models/Reservation.js';
import { type Screening } from '../models/Screening.js';
import type { Seat } from '../models/Seat.js';
import { wait } from '../utils/wait.js';

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

	static async getScreeningAction(screenings: Screening[]): Promise<'back' | string> {
		const choices = [
			...screenings.map((screening) => {
				const date = new Date(screening.startTime);
				return {
					name: `${date.toLocaleDateString()} at ${date.toLocaleTimeString()} (${screening.hallName})`,
					value: screening.id,
				};
			}),
			new inquirer.Separator(),
			{ name: 'Back to Movie Details', value: 'back' },
		];

		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Select a screening to make a reservation or go back:',
				choices,
			},
		]);

		return answer.action;
	}

	static displaySeatsGrid(seats: Seat[][], selectedSeats: string[] = []): void {
		if (!seats.length || !seats[0]?.length) {
			throw new Error('Invalid seats grid provided');
		}

		console.clear();
		console.log(chalk.cyan('=== Select Your Seats ===\n'));

		console.log('Legend:');
		console.log('🟦 Available Standard Seat');
		console.log('🟨 Available VIP Seat');
		console.log('♿ Available Disabled Seat');
		console.log('🟥 Reserved Seat');
		console.log('✅ Your Selected Seat\n');

		console.log(chalk.white.bold('🎬 SCREEN 🎬').padStart(40));
		console.log('\n' + '▔'.repeat(50) + '\n');

		process.stdout.write('   ');
		for (let col = 1; col <= seats[0].length; col++) {
			process.stdout.write(` ${col.toString().padStart(2)} `);
		}
		console.log('\n');

		seats.forEach((row, rowIndex) => {
			process.stdout.write(`${String.fromCharCode(65 + rowIndex)} `);
			row.forEach((seat) => {
				let seatSymbol;
				if (selectedSeats.includes(seat.id)) {
					seatSymbol = '✅';
				} else if (seat.isReserved) {
					seatSymbol = '🟥';
				} else {
					switch (seat.type) {
						case 'STANDARD':
							seatSymbol = '🟦';
							break;
						case 'VIP':
							seatSymbol = '🟨';
							break;
						case 'DISABLED':
							seatSymbol = '♿';
							break;
					}
				}
				process.stdout.write(` ${seatSymbol} `);
			});
			console.log();
		});
		console.log();
	}

	static async selectSeats(seats: Seat[][]): Promise<string[]> {
		const selectedSeats: string[] = [];
		const selecting = true;

		if (!seats.length || !seats[0]?.length) {
			throw new Error('Invalid seats grid provided');
		}

		const numCols = seats[0].length;

		while (selecting) {
			this.displaySeatsGrid(seats, selectedSeats);

			const answer = await inquirer.prompt([
				{
					type: 'list',
					name: 'action',
					message: 'Choose an action:',
					choices: [
						{ name: 'Select a seat', value: 'select' },
						{
							name: 'Remove a selected seat',
							value: 'remove',
							disabled: selectedSeats.length === 0,
						},
						{
							name: 'Continue to payment',
							value: 'continue',
							disabled: selectedSeats.length === 0,
						},
						{ name: 'Cancel reservation', value: 'cancel' },
					],
				},
			]);

			if (answer.action === 'cancel') {
				return [];
			}

			if (answer.action === 'continue') {
				break;
			}

			if (answer.action === 'select') {
				const { row } = await inquirer.prompt([
					{
						type: 'input',
						name: 'row',
						message: 'Enter row letter:',
						validate: (input) => /^[A-Z]$/.test(input.toUpperCase()),
						filter: (input) => input.toUpperCase(),
					},
				]);

				const { column } = await inquirer.prompt([
					{
						type: 'number',
						name: 'column',
						message: 'Enter column number:',
						validate: (input) => !!input && !isNaN(input) && input > 0 && input <= numCols,
					},
				]);

				const rowIndex = row.charCodeAt(0) - 65;
				const seat = seats[rowIndex]?.[column - 1];

				if (!seat) {
					console.log(chalk.red('\nInvalid seat selection.'));
					await wait();
					continue;
				}

				if (seat.isReserved) {
					console.log(chalk.red('\nThis seat is already reserved.'));
					await wait();
					continue;
				}

				if (!selectedSeats.includes(seat.id)) {
					selectedSeats.push(seat.id);
				}
			}

			if (answer.action === 'remove') {
				const { seatToRemove } = await inquirer.prompt([
					{
						type: 'list',
						name: 'seatToRemove',
						message: 'Select seat to remove:',
						choices: selectedSeats.map((seatId) => {
							const seat = seats.flat().find((s) => s.id === seatId);
							if (!seat) {
								throw new Error(`Could not find seat with ID: ${seatId}`);
							}
							return {
								name: `Row ${String.fromCharCode(65 + seat.row)} Seat ${seat.column + 1}`,
								value: seatId,
							};
						}),
					},
				]);
				const index = selectedSeats.indexOf(seatToRemove);
				selectedSeats.splice(index, 1);
			}
		}

		return selectedSeats;
	}

	static async getPaymentMethod(): Promise<PaymentMethod> {
		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'paymentMethod',
				message: 'Choose payment method:',
				choices: [
					{ name: '💳 Pay with Card', value: 'CARD' },
					{ name: '💵 Pay with Cash', value: 'CASH' },
				],
			},
		]);

		return answer.paymentMethod;
	}

	static async handleCardPayment(): Promise<boolean> {
		console.clear();
		console.log(chalk.cyan('=== Card Payment ===\n'));

		await inquirer.prompt([
			{
				type: 'input',
				name: 'cardNumber',
				message: 'Enter card number:',
				validate: (input) => /^\d{16}$/.test(input) || 'Please enter a valid 16-digit card number',
			},
			{
				type: 'input',
				name: 'expiryDate',
				message: 'Enter expiry date (MM/YY):',
				validate: (input) =>
					/^\d{2}\/\d{2}$/.test(input) || 'Please enter a valid expiry date (MM/YY)',
			},
			{
				type: 'input',
				name: 'cvv',
				message: 'Enter CVV:',
				validate: (input) => /^\d{3}$/.test(input) || 'Please enter a valid 3-digit CVV',
			},
		]);

		console.log(chalk.yellow('\nProcessing payment...'));
		await wait(1000);

		return true;
	}

	static displayCashPaymentInstructions(
		reservationId: string,
		startTime: Date,
		expiresAt: Date,
	): void {
		console.clear();
		console.log(chalk.cyan('=== Cash Payment Instructions ===\n'));
		console.log(chalk.yellow('Please note the following details:'));
		console.log(`Reservation ID: ${chalk.bold(reservationId)}`);

		const now = new Date();
		const timeUntilScreening = startTime.getTime() - now.getTime();
		const thirtyMinutesInMs = 30 * 60 * 1000;
		const fifteenMinutesInMs = 15 * 60 * 1000;

		console.log(`\nScreening starts at: ${chalk.bold(startTime.toLocaleString())}`);
		console.log(`Reservation expires at: ${chalk.bold(expiresAt.toLocaleString())}`);

		if (timeUntilScreening <= thirtyMinutesInMs) {
			console.log(chalk.red('\nIMPORTANT: Screening starts soon!'));
			console.log(
				`Your reservation will be held for ${Math.ceil(
					fifteenMinutesInMs / (60 * 1000),
				)} minutes only. Please pay at the cinema counter as soon as possible.`,
			);
		} else {
			console.log(chalk.green('\nYou have sufficient time to complete your payment.'));
			console.log(
				'Please ensure you pay at the cinema counter at least 30 minutes before the screening starts to confirm your reservation.',
			);
		}

		console.log(
			chalk.red('\nNote: Unpaid reservations will be automatically cancelled after expiration.'),
		);
	}
}
