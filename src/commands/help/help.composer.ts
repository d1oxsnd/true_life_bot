import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { UI } from '../../ui/theme.js'
import { hasPermission } from '../../lib/roles.js'
import { Role } from '../../generated/prisma/enums.js'

export const helpComposer = new Composer<MyContext>()

helpComposer.hears(
  /^(?:\/help|помощь|команды|help|хелп)$/i,
  authMiddleware,
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const lines: string[] = [
      UI.header(ctx.user.username ?? ctx.from.first_name, ctx.from.id, 'доступные команды', '❓'),
      '👤 *ПРОФИЛЬ И СТАТУС:*',
      '      `профиль` / `п` — Просмотр карточки профиля и баланса',
      '      `статус` / `статусы` — Просмотр игровых статусов и цены апгрейда',
      '      `статус поднять` — Покупка следующего статуса',
      '',
      '🔨 *РАБОТА И СМЕНЫ:*',
      '      `смена` / `работа` — Информация о смене, стрике и доступных работах',
      '      `поработать` / `смена выйти` — Выйти на смену и заработать денег',
      '',
      '💸 *ЭКОНОМИКА И ИГРЫ:*',
      '      `перевести [ID] [сумма]` — Перевести деньги по ID пользователя',
      '      `перевести [сумма]` — Перевести деньги (в ответ на сообщение)',
      '      `слоты [сумма]` / `слоты все` — Игра в казино / слот-машину',
      '      `ограбить` — Попытка ограбить игрока (в ответ на сообщение)',
    ]

    if (hasPermission(ctx.user.role, Role.MODERATOR)) {
      lines.push('')
      lines.push('🛡 *АДМИНИСТРИРОВАНИЕ:*')
      lines.push('      `/adminhelp` — Панель админ-команд для персонала')
    }

    lines.push('')
    lines.push(UI.guide('💡', 'Быстрый старт', 'поработать', 'выйти на рабочую смену'))

    await ctx.smartReply(lines.join('\n'), { parse_mode: 'Markdown' })
  },
)
