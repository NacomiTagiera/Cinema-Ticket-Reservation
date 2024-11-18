import { type User } from '@prisma/client';
import prisma from '../prisma.js';
import { type IUserRepository, type CreateUserData } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
	async findById(id: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { id },
		});
	}

	async create(data: Omit<User, 'id'>): Promise<User> {
		return prisma.user.create({
			data,
		});
	}

	async createUser(data: CreateUserData): Promise<User> {
		return prisma.user.create({
			data: {
				...data,
				role: 'USER',
			},
		});
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		return prisma.user.update({
			where: { id },
			data,
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.user.delete({
			where: { id },
		});
	}

	async findByUsername(username: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { username },
		});
	}

	async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
		return prisma.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		});
	}
}
