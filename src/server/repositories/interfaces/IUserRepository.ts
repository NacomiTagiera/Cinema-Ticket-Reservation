import { type User } from '@prisma/client';
import { type IBaseRepository } from './IBaseRepository';

export type CreateUserData = {
	username: string;
	email: string;
	password: string;
};

export interface IUserRepository extends IBaseRepository<User> {
	findByUsername(username: string): Promise<User | null>;
	findByUsernameOrEmail(username: string, email: string): Promise<User | null>;
	createUser(data: CreateUserData): Promise<User>;
}
