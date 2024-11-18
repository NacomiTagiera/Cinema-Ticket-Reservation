import { type Hall } from '@prisma/client';
import { type IBaseRepository } from './IBaseRepository';

export interface IHallRepository extends Pick<IBaseRepository<Hall>, 'findById'> {
	findAll(): Promise<Hall[]>;
}