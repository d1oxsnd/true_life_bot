import { Role } from '../generated/prisma/client.js'
import type { UserRepository } from '../repositories/user.js'

export const RoleWeight: Record<Role, number> = {
  [Role.BOMZH]: 1,
  [Role.PLANKTON]: 2,
  [Role.BUSINESS_PLUS]: 3,
  [Role.MODERATOR]: 4,
  [Role.ADMIN]: 5,
}

export class PermissionService {
  constructor(private userRepo: UserRepository) {}

  async hasPermission(telegramId: bigint, requiredRole: Role): Promise<boolean> {
    const player = await this.userRepo.findUserByTelegramId(telegramId)
    if (!player) return false

    return RoleWeight[player.role] >= RoleWeight[requiredRole]
  }
}