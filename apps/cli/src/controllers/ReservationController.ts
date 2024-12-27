import { ApiService } from '../services/ApiService.js';
import { handleError } from '../utils/errorHandler.js';
import { wait } from '../utils/wait.js';
import { ReservationView } from '../views/ReservationView.js';

export class ReservationController {
	static async handleViewReservations(): Promise<void> {
		try {
			const reservations = await ApiService.getUserReservations();
			ReservationView.displayReservations(reservations);

			const action = await ReservationView.getReservationAction();
			if (action === 'back') {
				return;
			}
		} catch (error) {
			handleError(error, 'Failed to fetch reservations');
			await wait();
		}
	}
}
