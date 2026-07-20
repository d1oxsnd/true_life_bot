import { prisma } from '../lib/prisma.js'
import { generateId } from '../utils/id.generator.js'
import type { User, BankAccount, Role } from '../generated/prisma/client.js'

export type UserWithBankAccount = User & { bankAccount: BankAccount | null }

export class UserRepository {
	async createUser(data: {
		telegramId: bigint
	}): Promise<UserWithBankAccount> {
		const id = generateId()

		return await prisma.user.create({
			data: {
				id,
				telegramId: data.telegramId,
				bankAccount: {
					create: {},
				},
			},
			include: {
				bankAccount: true,
			},
		})
	}

	async findUserByTelegramId(telegramId: bigint): Promise<UserWithBankAccount | null> {
		return await prisma.user.findUnique({
			where: {
				telegramId,
			},
			include: {
				bankAccount: true,
			},
		})
	}

	async updateUser(
		telegramId: bigint,
		data: { username?: string; role?: Role },
	): Promise<UserWithBankAccount> {
		return await prisma.user.update({
			where: {
				telegramId,
			},
			data: {
				...data,
			},
			include: {
				bankAccount: true,
			},
		})
	}

	async deleteUser(telegramId: bigint): Promise<UserWithBankAccount> {
		return await prisma.user.delete({
			where: {
				telegramId,
			},
			include: {
				bankAccount: true,
			},
		})
	}
}
