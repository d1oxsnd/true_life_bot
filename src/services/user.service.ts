import type { Role } from '../generated/prisma/enums.js'
import type { UserRepository } from '../repositories/user.repository.js'
import type { UserWithBank } from '../repositories/user.repository.js'

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getOrCreateUser(telegramId: bigint): Promise<UserWithBank> {
    return this.userRepo.getOrCreate(telegramId)
  }

  async getUserByTelegramId(telegramId: bigint): Promise<UserWithBank | null> {
    return this.userRepo.findByTelegramId(telegramId)
  }

  async getUserById(id: string): Promise<UserWithBank | null> {
    return this.userRepo.findById(id)
  }

  async findByUsername(username: string) {
    return this.userRepo.findByUsername(username)
  }

  async updateUser(
    telegramId: bigint,
    data: { username?: string; role?: Role }
  ): Promise<UserWithBank> {
    return this.userRepo.update(telegramId, data)
  }

  async banUser(telegramId: bigint): Promise<UserWithBank> {
  return this.userRepo.update(telegramId, { isBanned: true })
}

// 💡 Разбанить пользователя
async unbanUser(telegramId: bigint): Promise<UserWithBank> {
  return this.userRepo.update(telegramId, { isBanned: false })
}

  async deleteUser(telegramId: bigint): Promise<UserWithBank> {
    return this.userRepo.delete(telegramId)
  }
}