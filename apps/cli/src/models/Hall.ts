import { type Seat } from './Seat';

export interface Hall {
	id: string;
	name: string;
	rows: number;
	columns: number;
	seats: Seat[];
}
