import type { UserRepository } from '../repositories/user.js'
import { GAME_CONFIG } from '../configs/constants.js'

export type ChangeIdResult =
  | { success: true; oldId: string; newId: string; targetUsername: string }
  | { success: false; reason: 'USER_NOT_FOUND' | 'ID_TAKEN' | 'INVALID_FORMAT' }

export class AdminService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Изменение игрового ID администратором
   */
  async changePlayerId(
    targetIdentifier: { type: 'telegramId'; id: bigint } | { type: 'customId'; id: string },
    newId: string,
  ): Promise<ChangeIdResult> {
    const trimmedNewId = newId.trim()

    if (
      trimmedNewId.length < GAME_CONFIG.USER_ID.MIN_LENGTH ||
      trimmedNewId.length > GAME_CONFIG.USER_ID.MAX_LENGTH ||
      /\s/.test(trimmedNewId)
    ) {
      return { success: false, reason: 'INVALID_FORMAT' }
    }

    const player =
      targetIdentifier.type === 'telegramId'
        ? await this.userRepo.findUserByTelegramId(targetIdentifier.id)
        : await this.userRepo.findUserById(targetIdentifier.id)

    if (!player) {
      return { success: false, reason: 'USER_NOT_FOUND' }
    }

    const existingUser = await this.userRepo.findUserById(trimmedNewId)
    if (existingUser) {
      return { success: false, reason: 'ID_TAKEN' }
    }

    const oldId = player.id
    await this.userRepo.changeUserId(oldId, trimmedNewId)

    return {
      success: true,
      oldId,
      newId: trimmedNewId,
      targetUsername: player.username,
    }
  }
}