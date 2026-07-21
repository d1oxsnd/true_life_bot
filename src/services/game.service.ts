import { Role } from '../generated/prisma/client.js'
import type { UserRepository, UserWithBankAccount } from '../repositories/user.js'

export const NICKNAME_CHANGE_COST = 500
export const MIN_NICKNAME_LENGTH = 3
export const MAX_NICKNAME_LENGTH = 9

export const RoleWeight: Record<Role, number> = {
  [Role.BOMZH]: 1,
  [Role.PLANKTON]: 2,
  [Role.BUSINESS_PLUS]: 3,
  [Role.MODERATOR]: 4,
  [Role.ADMIN]: 5,
}

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

export class GameService {
  constructor(private userRepo: UserRepository) {}

  async handlePlayerLogin(telegramId: bigint): Promise<UserWithBankAccount> {
    const player = await this.userRepo.findUserByTelegramId(telegramId)

    if (!player) {
      return await this.userRepo.createUser({ telegramId })
    }

    return player
  }

  async hasPermission(telegramId: bigint, requiredRole: Role): Promise<boolean> {
    const player = await this.userRepo.findUserByTelegramId(telegramId)
    if (!player) return false

    return RoleWeight[player.role] >= RoleWeight[requiredRole]
  }

  async changeUsername(
    telegramId: bigint,
    newUsername: string,
  ): Promise<ChangeUsernameResult> {
    const player = await this.userRepo.findUserByTelegramId(telegramId)
    if (!player || !player.bankAccount) {
      return { success: false, reason: 'ACCOUNT_NOT_FOUND' }
    }

    const trimmedNick = newUsername.trim()

    // Используем константы для проверки длины
    if (trimmedNick.length < MIN_NICKNAME_LENGTH || trimmedNick.length > MAX_NICKNAME_LENGTH) {
      return { success: false, reason: 'INVALID_LENGTH' }
    }

    const existingUser = await this.userRepo.findUserByUsername(trimmedNick)
    if (existingUser) {
      return { success: false, reason: 'NICKNAME_TAKEN' }
    }

    if (player.bankAccount.balance < BigInt(NICKNAME_CHANGE_COST)) {
      return { success: false, reason: 'INSUFFICIENT_FUNDS' }
    }

    const newBalance = player.bankAccount.balance - BigInt(NICKNAME_CHANGE_COST)

    await this.userRepo.updateUsernameWithDeduction(
      player.id,
      telegramId,
      trimmedNick,
      newBalance,
    )

    return {
      success: true,
      newUsername: trimmedNick,
      cost: NICKNAME_CHANGE_COST,
    }
  }
}