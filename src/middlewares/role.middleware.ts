import type { Middleware } from 'grammy'
import type { MyContext } from '../types/context.js'
import { Role } from '../generated/prisma/client.js'
import { RoleLabels, hasPermission } from '../lib/roles.js'

export function requireRole(minRole: Role, commandName: string): Middleware<MyContext> {
  return async (ctx, next) => {

    if (!ctx.user) return


    if (!hasPermission(ctx.user.role, minRole)) {

      const isStaffCommand = hasPermission(minRole, Role.MODERATOR)

      if (isStaffCommand) {
        return
      }

      const requiredRoleLabel = RoleLabels[minRole] ?? minRole

      return await ctx.smartReply(
        `🔒 Команда \`${commandName}\` доступна только\n` +
          `       статусу _${requiredRoleLabel}_ и выше`,
        { parse_mode: 'Markdown' },
      )
    }
		
    await next()
  }
}