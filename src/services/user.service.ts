import type { UserRepository, UserWithBankAccount } from '../repositories/user.js'
import { GAME_CONFIG } from '../configs/constants.js'
import { Role } from '../generated/prisma/client.js'

export type ChangeUsernameResult =
  | { success: true; newUsername: string; cost: number }
  | {
      success: false
      reason:
        | 'ACCOUNT_NOT_FOUND'
        | 'INVALID_LENGTH'
        | 'NICKNAME_TAKEN'
        | 'INSUFFICIENT_FUNDS'
    }

export class UserService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Логин пользователя + автоматическое назначение главного админа из ENV
   */
  async handlePlayerLogin(telegramId: bigint): Promise<UserWithBankAccount> {
    let player = await this.userRepo.findUserByTelegramId(telegramId)

    if (!player) {
      player = await this.userRepo.createUser({ telegramId })
    }

    // Проверка на Супер-Админа из .env
    const envAdminId = process.env.ADMIN_TELEGRAM_ID
    if (envAdminId && telegramId === BigInt(envAdminId) && player.role !== Role.ADMIN) {
      player = await this.userRepo.updateUser(telegramId, { role: Role.ADMIN })
    }

    return player
  }

  /**
   * Смена игрового ника
   */
  async changeUsername(
    telegramId: bigint,
    newUsername: string,
  ): Promise<ChangeUsernameResult> {
    const player = await this.userRepo.findUserByTelegramId(telegramId)
    if (!player || !player.bankAccount) {
      return { success: false, reason: 'ACCOUNT_NOT_FOUND' }
    }

    const trimmedNick = newUsername.trim()

    if (
      trimmedNick.length < GAME_CONFIG.NICKNAME.MIN_LENGTH ||
      trimmedNick.length > GAME_CONFIG.NICKNAME.MAX_LENGTH
    ) {
      return { success: false, reason: 'INVALID_LENGTH' }
    }

    const existingUser = await this.userRepo.findUserByUsername(trimmedNick)
    if (existingUser) {
      return { success: false, reason: 'NICKNAME_TAKEN' }
    }

    const cost = GAME_CONFIG.NICKNAME.COST
    if (player.bankAccount.balance < BigInt(cost)) {
      return { success: false, reason: 'INSUFFICIENT_FUNDS' }
    }

    const newBalance = player.bankAccount.balance - BigInt(cost)

    await this.userRepo.updateUsernameWithDeduction(
      player.id,
      telegramId,
      trimmedNick,
      newBalance,
    )

    return {
      success: true,
      newUsername: trimmedNick,
      cost,
    }
  }
}