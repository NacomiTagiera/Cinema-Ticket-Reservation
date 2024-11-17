import chalk from 'chalk';
import { ApiService } from '../services/ApiService.js';
import { AuthStore } from '../store/AuthStore.js';
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
							const screeningAction = await MovieView.getScreeningAction(screenings);

							if (screeningAction !== 'back') {
								const authStore = AuthStore.getInstance();
								if (!authStore.isAuthenticated) {
									console.log(chalk.yellow('\nYou must be logged in to make a reservation.'));
									await wait();
									continue;
								}

								const selectedScreening = screenings.find((s) => s.id === screeningAction);
								if (selectedScreening) {
									const seats = await ApiService.getScreeningSeats(selectedScreening.id);
									const selectedSeats = await MovieView.selectSeats(seats);

									if (selectedSeats.length > 0) {
										const totalPrice = seats
											.flat()
											.filter((seat) => selectedSeats.includes(seat.id))
											.reduce((sum, seat) => sum + seat.price, 0);

										console.log(chalk.green(`\nTotal price: $${totalPrice.toFixed(2)}`));
										const paymentMethod = await MovieView.getPaymentMethod();

										try {
											const reservation = await ApiService.createReservation({
												screeningId: selectedScreening.id,
												seatIds: selectedSeats,
												paymentMethod,
											});

											if (paymentMethod === 'CARD') {
												const paymentSuccessful = await MovieView.handleCardPayment();
												if (paymentSuccessful) {
													await ApiService.confirmPayment(reservation.id, 'CARD');
													console.log(
														chalk.green('\nPayment successful! Your seats are confirmed.'),
													);
												} else {
													console.log(
														chalk.red('\nPayment failed. Your reservation will be cancelled.'),
													);
												}
											} else {
												await ApiService.confirmPayment(reservation.id, 'CASH');
												MovieView.displayCashPaymentInstructions(
													reservation.id,
													new Date(reservation.screening.startTime),
													new Date(reservation.expiresAt),
												);
											}
											await wait(10000);
										} catch (error) {
											handleError(error, 'Failed to create reservation');
											await wait();
										}
									}
								}
							}
							continue;
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
