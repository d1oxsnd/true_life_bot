import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { UI } from '../../ui/theme.js'

export const robberyComposer = new Composer<MyContext>()

robberyComposer.hears(/^(ограбить|грабеж|спиздить)$/i, authMiddleware, async ctx => {
  if (!ctx.user || !ctx.from) return

  const replyMessage = ctx.message?.reply_to_message
  const victimTgUser = replyMessage?.from

  // 1. Подсказка, если не ответили на сообщение
  if (!replyMessage || !victimTgUser) {
    return await ctx.smartReply(
      UI.guide('🏴‍☠️', 'Чтобы ограбить кого-то', 'ограбить', "в ответ на сообщение"),
      { parse_mode: 'Markdown' },
    )
  }

  // 2. Игнорируем ботов и самого себя
  if (victimTgUser.is_bot || victimTgUser.id === ctx.from.id) {
    return
  }

  const victim = await ctx.services.user.getOrCreateUser(BigInt(victimTgUser.id))
  const victimBalance = victim.bankAccount?.balance ?? 0n

  const result = await ctx.services.robbery.attemptRobbery(ctx.user.id, victim.id, victimBalance)

  const victimMention = `[${victim.username}](tg://user?id=${victimTgUser.id})`

  // 3. Обработка неудач
  if (!result.success) {
    if (result.reason === 'COOLDOWN') {
      const totalSeconds = Math.ceil(result.remainingMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)

      return await ctx.smartReply(
        UI.actionCard({
          username: ctx.user.username,
          userId: ctx.from.id,
          action: 'надо залечь на дно!',
          icon: '🥷🏻⏳',
          content: `Грабить можно через _${hours}ч. ${minutes}мин._`,
        }),
        { parse_mode: 'Markdown' },
      )
    }

    if (result.reason === 'VICTIM_IS_POOR') {
      return await ctx.smartReply(
        UI.actionCard({
          username: ctx.user.username,
          userId: ctx.from.id,
          action: `попытался ограбить БОМЖА ${victimMention} 🤣`,
          icon: '🥷🏻',
        }),
        { parse_mode: 'Markdown' },
      )
    }

    // Неудача по шансу (сирены)
    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username,
        userId: ctx.from.id,
        action: `попытался ограбить ${victimMention}`,
        icon: '🥷🏻🚨',
        content: 'но заиграли сирены',
      }),
      { parse_mode: 'Markdown' },
    )
  }

  // 4. Успешный грабёж
  const stolenAmount = result.stolenAmount ?? 0n

  return await ctx.smartReply(
    UI.actionCard({
      username: ctx.user.username,
      userId: ctx.from.id,
      action: `успешно ограбил ${victimMention}`,
      icon: '🥷🏻🎊',
      statusTitle: 'Награблено',
      money: { amount: stolenAmount, sign: '+' },
    }),
    { parse_mode: 'Markdown' },
  )
})