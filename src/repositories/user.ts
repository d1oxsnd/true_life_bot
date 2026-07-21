import { prisma } from '../lib/prisma.js'
import { generateId } from '../utils/id.generator.js'
import type { User, BankAccount, Role } from '../generated/prisma/client.js'

export type UserWithBankAccount = User & { bankAccount: BankAccount | null }

export class UserRepository {
	async createUser(data: { telegramId: bigint }): Promise<UserWithBankAccount> {
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

	async findUserByUsername(username: string): Promise<User | null> {
		return await prisma.user.findUnique({
			where: { username },
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

	async updateUsernameWithDeduction(
		userId: string,
		telegramId: bigint,
		newUsername: string,
		newBalance: bigint,
	): Promise<UserWithBankAccount> {
		return await prisma.$transaction(async tx => {
			await tx.bankAccount.update({
				where: { userId },
				data: { balance: newBalance },
			})

			return await tx.user.update({
				where: { telegramId },
				data: { username: newUsername },
				include: { bankAccount: true },
			})
		})
	}

	async findUserById(id: string): Promise<UserWithBankAccount | null> {
		return await prisma.user.findUnique({
			where: { id },
			include: { bankAccount: true },
		})
	}

	async changeUserId(oldId: string, newId: string): Promise<UserWithBankAccount> {
		return await prisma.$transaction(async tx => {
			return await tx.user.update({
				where: { id: oldId },
				data: { id: newId },
				include: { bankAccount: true },
			})
		})
	}
}
