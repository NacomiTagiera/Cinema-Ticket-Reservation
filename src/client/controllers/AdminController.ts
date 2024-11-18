import chalk from 'chalk';
import { ApiService } from '../services/ApiService.js';
import { handleError } from '../utils/errorHandler.js';
import { wait } from '../utils/wait.js';
import { AdminView } from '../views/AdminView.js';

export class AdminController {
	static async handleManageMovies(): Promise<void> {
		try {
			const movies = await ApiService.getAllMovies();
			const action = await AdminView.getMovieManagementAction();

			switch (action) {
				case 'add': {
					const newMovie = await AdminView.getNewMovieDetails();
					await ApiService.createMovie(newMovie);
					console.log(chalk.green('Movie added successfully!'));
					break;
				}
				case 'edit': {
					const movieToEdit = await AdminView.selectMovie(movies);
					if (movieToEdit) {
						const updatedData = await AdminView.getMovieUpdateDetails(movieToEdit);
						await ApiService.updateMovie(movieToEdit.id, updatedData);
						console.log(chalk.green('Movie updated successfully!'));
					}
					break;
				}
				case 'delete': {
					const movieToDelete = await AdminView.selectMovie(movies);
					if (movieToDelete) {
						const confirmed = await AdminView.confirmDeletion('movie');
						if (confirmed) {
							await ApiService.deleteMovie(movieToDelete.id);
							console.log(chalk.green('Movie deleted successfully!'));
						}
					}
					break;
				}
			}
			await wait();
		} catch (error) {
			handleError(error, 'Failed to manage movies');
			await wait();
		}
	}

	static async handleManageScreenings(): Promise<void> {
		try {
			const movies = await ApiService.getAllMovies();
			const halls = await ApiService.getHalls();
			const screenings = await ApiService.getScreenings();
			const action = await AdminView.getScreeningManagementAction();

			switch (action) {
				case 'add': {
					const newScreeningAnswers = await AdminView.getNewScreeningDetails(movies, halls);
					const selectedMovie = movies.find((m) => m.id === newScreeningAnswers.movieId);
					const selectedHall = halls.find((h) => h.id === newScreeningAnswers.hallId);

					if (!selectedMovie || !selectedHall) {
						throw new Error('Selected movie or hall not found');
					}

					const startDateTime = new Date(newScreeningAnswers.startTime);
					const endDateTime = new Date(startDateTime.getTime() + selectedMovie.duration * 60000);

					const screeningData = {
						...newScreeningAnswers,
						hallName: selectedHall.name,
						endTime: endDateTime,
						createdAt: new Date(),
						updatedAt: new Date(),
					};

					await ApiService.createScreening(screeningData);
					console.log(chalk.green('Screening added successfully!'));
					break;
				}
				case 'edit': {
					const screeningToEdit = await AdminView.selectScreening(screenings);
					if (screeningToEdit) {
						const updatedData = await AdminView.getScreeningUpdateDetails(
							screeningToEdit,
							movies,
							halls,
						);
						await ApiService.updateScreening(screeningToEdit.id, updatedData);
						console.log(chalk.green('Screening updated successfully!'));
					}
					break;
				}
				case 'delete': {
					const screeningToDelete = await AdminView.selectScreening(screenings);
					if (screeningToDelete) {
						const confirmed = await AdminView.confirmDeletion('screening');
						if (confirmed) {
							await ApiService.deleteScreening(screeningToDelete.id);
							console.log(chalk.green('Screening deleted successfully!'));
						}
					}
					break;
				}
			}
			await wait();
		} catch (error) {
			handleError(error, 'Failed to manage screenings');
			await wait();
		}
	}

	static async handleManagePayments(): Promise<void> {
		try {
			console.clear();
			console.log(chalk.cyan('=== Manage Cash Payments ===\n'));

			const reservationId = await AdminView.getReservationId();
			const reservation = await ApiService.getReservation(reservationId);

			if (!reservation) {
				console.log(chalk.red('Reservation not found'));
				await wait();
				return;
			}

			if (reservation.paymentStatus === 'PAID') {
				console.log(chalk.yellow('This reservation is already paid'));
				await wait();
				return;
			}

			if (reservation.status === 'CANCELLED') {
				console.log(chalk.red('This reservation is cancelled'));
				await wait();
				return;
			}

			if (reservation.paymentMethod !== 'CASH') {
				console.log(chalk.red('This reservation is not marked for cash payment'));
				await wait();
				return;
			}

			const confirmed = await AdminView.confirmPayment(reservation);
			if (confirmed) {
				await ApiService.confirmCashPayment(reservationId);
				console.log(chalk.green('\nPayment confirmed successfully!'));
			} else {
				console.log(chalk.yellow('\nPayment confirmation cancelled.'));
			}

			await wait(3000);
		} catch (error) {
			console.error('Detailed error:', error);
			handleError(error, 'Failed to manage payment');
			await wait();
		}
	}
}
