export interface Seat {
	id: string;
	row: number;
	column: number;
	type: 'STANDARD' | 'VIP' | 'DISABLED';
	price: number;
	isReserved: boolean;
}
