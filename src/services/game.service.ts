import { Role } from '../generated/prisma/client.js'
import type { UserRepository, UserWithBankAccount } from '../repositories/user.ts'

export const RoleWeight: Record<Role, number> = {
	[Role.BOMZH]: 1,
	[Role.PLANKTON]: 2,
	[Role.BUSINESS_PLUS]: 3,
	[Role.MODERATOR]: 4,
	[Role.ADMIN]: 5,
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
}
