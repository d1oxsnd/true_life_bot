import { prisma } from '../lib/prisma.js'
import { generateId } from '../utils/id.generator.js'
import type { User, BankAccount, Role } from '../generated/prisma/client.js'

export type UserWithBank = User & { bankAccount: BankAccount | null }

export class UserRepository {
  async create(telegramId: bigint): Promise<UserWithBank> {
    const id = generateId()
    const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase()

    return prisma.user.create({
      data: {
        id,
        telegramId,
        username: `Юзер-${randomSuffix}`,
        bankAccount: { create: {} },
      },
      include: { bankAccount: true },
    })
  }

  async findByTelegramId(telegramId: bigint): Promise<UserWithBank | null> {
    return prisma.user.findUnique({
      where: { telegramId },
      include: { bankAccount: true },
    })
  }

  async getOrCreate(telegramId: bigint): Promise<UserWithBank> {
    let user = await this.findByTelegramId(telegramId)
    if (!user) {
      user = await this.create(telegramId)
    }
    return user
  }

  async findById(id: string): Promise<UserWithBank | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { bankAccount: true },
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } })
  }

  async update(
    telegramId: bigint,
    data: { username?: string; role?: Role; isBanned?: boolean }
  ): Promise<UserWithBank> {
    return prisma.user.update({
      where: { telegramId },
      data,
      include: { bankAccount: true },
    })
  }

  async delete(telegramId: bigint): Promise<UserWithBank> {
    return prisma.user.delete({
      where: { telegramId },
      include: { bankAccount: true },
    })
  }
}