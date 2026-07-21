import type { Context, NextFunction } from 'grammy'
import type { PermissionService } from '../services/permission.service.js'
import { Role } from '../generated/prisma/client.js'
import { RoleLabels } from '../utils/roles.js'

export class GuardMiddleware {
  private readonly MANAGEMENT_ROLES: Role[] = [Role.MODERATOR, Role.ADMIN]

  constructor(private permissionService: PermissionService) {}

  requireRole(minRole: Role) {
    return async (ctx: Context, next: NextFunction) => {
      if (!ctx.from) return

      const hasAccess = await this.permissionService.hasPermission(BigInt(ctx.from.id), minRole)

      if (!hasAccess) {
        if (this.MANAGEMENT_ROLES.includes(minRole)) {
          return
        }

        const requiredRoleLabel = RoleLabels[minRole]

        await ctx.reply(
          `🔒 Доступ ограничен:\n` +
            `       команда только для _${requiredRoleLabel}_ и выше`,
          { parse_mode: 'Markdown' },
        )
        return
      }

      await next()
    }
  }
}