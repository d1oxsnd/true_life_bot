// src/middlewares/auth.middleware.ts
import type { Middleware } from 'grammy'
import type { MyContext } from '../types/context.js'
import { Role } from '../generated/prisma/client.js'

export const authMiddleware: Middleware<MyContext> = async (ctx, next) => {
  if (!ctx.from || ctx.from.is_bot) {
    return await next()
  }

  try {
    const telegramId = BigInt(ctx.from.id)
    let user = await ctx.services.user.getOrCreateUser(telegramId)

    const adminEnvId = process.env.ADMIN_TELEGRAM_ID
    if (adminEnvId && telegramId === BigInt(adminEnvId) && user.role !== Role.ADMIN) {
      user = await ctx.services.user.updateUser(telegramId, { role: Role.ADMIN })
    }

    if (user.isBanned) {
      return
    }

    ctx.user = user
  } catch (error) {
    console.error('Ошибка в authMiddleware:', error)
  }

  await next()
}