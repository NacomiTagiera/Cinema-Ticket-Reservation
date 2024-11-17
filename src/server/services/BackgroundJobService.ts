import { cancelExpiredReservations } from '../utils/cancelExpiredReservations.js';

export class BackgroundJobService {
	private static instance: BackgroundJobService;
	private intervalId: NodeJS.Timeout | null = null;
	private readonly CHECK_INTERVAL = 1 * 60 * 1000;

	private constructor() {}

	static getInstance(): BackgroundJobService {
		if (!BackgroundJobService.instance) {
			BackgroundJobService.instance = new BackgroundJobService();
		}
		return BackgroundJobService.instance;
	}

	start(): void {
		if (this.intervalId) {
			return;
		}
		console.log('Starting background job service...');
		this.intervalId = setInterval(() => {
			this.runJobs();
		}, this.CHECK_INTERVAL);
	}

	stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			console.log('Background job service stopped.');
		}
	}

	private async runJobs(): Promise<void> {
		try {
			await cancelExpiredReservations();
		} catch (error) {
			console.error('Error running background jobs: ', error);
		}
	}
}
