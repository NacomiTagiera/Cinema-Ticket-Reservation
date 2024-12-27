import chalk from 'chalk';
import inquirer from 'inquirer';
import type { ReservationWithDetails } from '../models/Reservation.js';

export class ReservationView {
	static displayReservations(reservations: ReservationWithDetails[]): void {
		console.clear();
		console.log(chalk.cyan('=== My Reservations ===\n'));

		if (reservations.length === 0) {
			console.log(chalk.yellow('You have no reservations.'));
			return;
		}

		reservations.forEach((reservation, index) => {
			console.log(chalk.white(`Reservation #${index + 1}`));
			console.log('─'.repeat(50));

			console.log(`🎬 Movie: ${chalk.bold(reservation.screening.movie.title)}`);
			console.log(`🏛️  Hall: ${reservation.screening.hall.name}`);
			console.log(`📅 Date: ${new Date(reservation.screening.startTime).toLocaleDateString()}`);
			console.log(`⏰ Time: ${new Date(reservation.screening.startTime).toLocaleTimeString()}`);

			const seats = reservation.reservedSeats
				.map((rs) => `${String.fromCharCode(64 + rs.seat.row)}${rs.seat.column}`)
				.join(', ');
			console.log(`💺 Seats: ${seats}`);

			console.log(`💰 Total Price: $${Number(reservation.totalPrice).toFixed(2)}`);
			console.log(`📊 Status: ${this.getStatusBadge(reservation.status)}`);
			console.log(`💳 Payment: ${this.getPaymentBadge(reservation.paymentStatus)}`);

			if (reservation.status === 'PENDING') {
				const expiresAt = new Date(reservation.expiresAt);
				if (expiresAt > new Date()) {
					console.log(chalk.yellow(`⚠️  Expires at: ${expiresAt.toLocaleString()}`));
				} else {
					console.log(chalk.red('⚠️  Reservation has expired'));
				}
			}

			console.log('\n');
		});
	}

	static async getReservationAction(): Promise<'back'> {
		const choices = [{ name: 'Back to Main Menu', value: 'back' }];

		const answer = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'Choose an action:',
				choices,
			},
		]);

		return answer.action;
	}

	private static getStatusBadge(status: string): string {
		switch (status) {
			case 'CONFIRMED':
				return chalk.green('✓ Confirmed');
			case 'PENDING':
				return chalk.yellow('⏳ Pending');
			case 'CANCELLED':
				return chalk.red('✗ Cancelled');
			default:
				return status;
		}
	}

	private static getPaymentBadge(status: string): string {
		switch (status) {
			case 'PAID':
				return chalk.green('✓ Paid');
			case 'UNPAID':
				return chalk.yellow('⏳ Unpaid');
			case 'REFUNDED':
				return chalk.blue('↺ Refunded');
			default:
				return status;
		}
	}
}
