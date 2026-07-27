import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { UI } from '../../ui/theme.js'
import { JOBS_BY_ROLE } from '../../lib/works.js'
import type { PlayableRole } from '../../lib/works.js'
import { Role } from '../../generated/prisma/enums.js'

export const workComposer = new Composer<MyContext>()

workComposer.hears(/^(смена|работа)$/i, authMiddleware, async ctx => {
  if (!ctx.user || !ctx.from) return

  try {
    const playableRole = (ctx.user.role === Role.ADMIN || ctx.user.role === Role.MODERATOR
      ? Role.BUSINESS_PLUS
      : ctx.user.role) as PlayableRole

    const roleConfig = JOBS_BY_ROLE[playableRole]
    if (!roleConfig) {
      return await ctx.smartReply(UI.error('Для вашего статуса нет доступных работ.'))
    }

    const stats = await ctx.services.work.getStats(ctx.user.id)
    const now = new Date()

    let cooldownText = '🟢 _Готов к работе!_'

    if (stats.lastWorkAt) {
      const elapsedMs = now.getTime() - stats.lastWorkAt.getTime()
      if (elapsedMs < roleConfig.cooldownMs) {
        const remainingMs = roleConfig.cooldownMs - elapsedMs
        const totalSeconds = Math.ceil(remainingMs / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        const timeStr = minutes > 0 ? `${minutes}мин. ${seconds}сек.` : `${seconds}сек.`
        cooldownText = `⏳ _Отдых еще ${timeStr}_`
      }
    }

    const streak = stats.streak || 0
    const streakBonus = streak > 1 ? (streak - 1) * 5 : 0
    const streakText = streak > 0 ? `🔥 *${streak}x* (+${streakBonus}%)` : '_Нет серии_'

    const jobsList = roleConfig.jobs
      .map(j => `      ${j.icon} ${j.title}`)
      .join('\n')

    const message = [
      UI.header(ctx.user.username ?? ctx.from.first_name, ctx.from.id, 'биржевая смена', '💼'),
      '📊 Статус смены:',
      `      ${cooldownText}`,
      '🔥 Текущий стрик:',
      `      ${streakText}`,
      '🛠 Доступные вакансии:',
      jobsList,
      '',
      UI.guide('💡', 'Чтобы выйти на смену', 'смена выйти'),
    ].join('\n')

    await ctx.smartReply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Ошибка в инфо смены:', error)
    await ctx.smartReply(UI.error('Не удалось загрузить информацию о смене.'))
  }
})

workComposer.hears(/^(?:смена\s+выйти|поработать|работать)$/i, authMiddleware, async ctx => {
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

    let statusTitle = 'Заработано'
    let eventNotice = ''

    if (event === 'CRIT') {
      statusTitle = 'ДЖЕКПОТ НА РАБОТЕ 🔥 (x3)'
      if (job.id.startsWith('ozon')) {
        eventNotice = '\n      🎉 _Фрод 10,000 пиков на ТСД сработал идеально!_'
      } else if (job.id.startsWith('freelance')) {
        eventNotice = '\n      🚀 _Жирный стартап из Кремниевой долины выплатил огромный оверпей!_'
      } else if (job.id.startsWith('infobiz')) {
        eventNotice = '\n      🔮 _Марафон Желаний зашел всей стране! Мешки наличных не вмещаются в Майбах!_'
      } else {
        eventNotice = '\n      🎉 _Супер выигрыш за смену!_'
      }
    } else if (event === 'BONUS') {
      statusTitle = 'Премия от руководства 🍩 (+50%)'
      if (job.id.startsWith('ozon')) {
        eventNotice = '\n      👍 _Старший смены выписал премию за перевыполнение нормы!_'
      } else if (job.id.startsWith('freelance')) {
        eventNotice = '\n      👍 _Заказчик принял работу с первого раза и отсыпал щедрых чаевых!_'
      } else if (job.id.startsWith('infobiz')) {
        eventNotice = '\n      👍 _Солдаты Изобилия раскупили весь ВИП-тариф за 5 минут!_'
      } else {
        eventNotice = '\n      👍 _Вы получили премию за усердие!_'
      }
    } else if (event === 'LOSS') {
      statusTitle = 'Штраф / Убытки 📉'
      if (job.id.startsWith('ozon')) {
        eventNotice = '\n      ⚠️ _Начальник смены доебался и ебанул штрафы за косой взгляд!_'
      } else if (job.id.startsWith('freelance')) {
        eventNotice = '\n      ⚠️ _Заказчик поиграл со шрифтами и сбежал без оплаты!_'
      } else if (job.id.startsWith('infobiz')) {
        eventNotice = '\n      ⚠️ _Пришла налоговая с проверкой дробления бизнеса и заблокировала счета!_'
      } else {
        eventNotice = '\n      ⚠️ _Смена завершилась в минус!_'
      }
    }

    const streakText = streak > 1 ? ` 🔥 Стрик: *${streak}x* (+${streakBonusPercent}%)` : ''
    const contentText = `${job.icon} *${job.title}*${streakText}${eventNotice}`

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