import type { Context, NextFunction } from 'grammy'
import type { GameService } from '../services/game.service.js'
import { Role } from '../generated/prisma/client.js'
import { RoleLabels } from '../utils/roles.js'

export class GuardMiddleware {
	private readonly MANAGEMENT_ROLES: Role[] = [Role.MODERATOR, Role.ADMIN]

	constructor(private gameService: GameService) {}

	requireRole(minRole: Role) {
		return async (ctx: Context, next: NextFunction) => {
			if (!ctx.from) return

			const hasAccess = await this.gameService.hasPermission(BigInt(ctx.from.id), minRole)

			if (!hasAccess) {
				if (this.MANAGEMENT_ROLES.includes(minRole)) {
					return
				}

				const requiredRoleLabel = RoleLabels[minRole]

				await ctx.reply(
					`🔒 **Доступ ограничен!**\n` +
						`Эта команда доступна только для статуса: *${requiredRoleLabel}* и выше.`,
					{ parse_mode: 'Markdown' },
				)
				return
			}

			await next()
		}
	}
}
