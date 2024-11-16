import axios from 'axios';
import chalk from 'chalk';

export const handleError = (error: unknown, message = 'An error occurred'): void => {
	if (axios.isAxiosError(error)) {
		const errorMessage = error.response?.data?.error || message;
		console.log(chalk.red(`\n⚠️  Error: ${errorMessage}\n`));
	} else {
		console.error('Error:', error);
	}
};
