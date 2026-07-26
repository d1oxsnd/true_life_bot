import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { UI } from '../../ui/theme.js'

export const workComposer = new Composer<MyContext>()

workComposer.hears(/^(работа|поработать|смена|работать)$/i, authMiddleware, async ctx => {
  if (!ctx.user || !ctx.from) return

  try {
    const result = await ctx.services.work.processWork(ctx.user.id, ctx.user.role)

    if (!result.success) {
      if (result.reason === 'COOLDOWN') {
        const totalSeconds = Math.ceil(result.remainingMs / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        const timeStr = minutes > 0 ? `${minutes}мин. ${seconds}сек.` : `${seconds}сек.`

        return await ctx.smartReply(
          UI.actionCard({
            username: ctx.user.username ?? ctx.from.first_name,
            userId: ctx.from.id,
            action: 'вы устали и отдышались',
            icon: '⌛️',
            content: `Следующая смена доступна через _${timeStr}_`,
          }),
          { parse_mode: 'Markdown' },
        )
      }

      return await ctx.smartReply(UI.error('Не удалось выйти на работу.'))
    }

    const { outcome } = result
    const { job, earned, streak, streakBonusPercent, event } = outcome

    // 2. Формируем плашки под события
    let statusTitle = 'Заработано'
    let eventNotice = ''

    if (event === 'CRIT') {
      statusTitle = 'ДЖЕКПОТ НА РАБОТЕ 🔥 (x3)'
      eventNotice = '\n      🎉 _Вы нашли редкую купюру на улице!_'
    } else if (event === 'BONUS') {
      statusTitle = 'Премия от босса 🍩 (+50%)'
      eventNotice = '\n      👍 _Начальник похвалил вас за усердие!_'
    } else if (event === 'LOSS') {
      statusTitle = 'Убытки по сделке 📉'
      eventNotice = '\n      ⚠️ _Рынок пошел против вас!_'
    }

    // 3. Формируем инфо по стрику
    const streakText = streak > 1 ? ` 🔥 Стрик: *${streak}x* (+${streakBonusPercent}%)` : ''
    const contentText = `${job.icon} *${job.title}*${streakText}${eventNotice}`

    // 4. Отправляем карточку через UI
    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username ?? ctx.from.first_name,
        userId: ctx.from.id,
        action: 'поработал на смене',
        icon: '🔨',
        content: contentText,
        statusTitle,
        money: {
          amount: earned < 0n ? -earned : earned,
          sign: earned < 0n ? '-' : '+',
        },
      }),
      { parse_mode: 'Markdown' },
    )
  } catch (error) {
    console.error('Ошибка в work.composer:', error)
    await ctx.smartReply(UI.error('Произошла ошибка во время работы. Попробуйте позже.'))
  }
})