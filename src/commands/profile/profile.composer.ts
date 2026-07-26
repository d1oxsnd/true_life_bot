import { Composer } from 'grammy'
import type { Role } from '../../generated/prisma/enums.js'
import { RoleLabels } from '../../lib/roles.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import type { MyContext } from '../../types/context.js'
import { formatMoney } from '../../utils/money.formatter.js'
import { getTargetPlayer } from '../../utils/user.extractor.js'
import { UI } from '../../ui/theme.js'

export const profileComposer = new Composer<MyContext>()

profileComposer.hears(/^профиль$/i, authMiddleware, async ctx => {
  if (!ctx.user || !ctx.from) return

  try {
    const targetData = await getTargetPlayer(ctx)
    if (!targetData) return

    const { player, targetTgUser } = targetData

    const robberyStats = await ctx.services.robbery.getStats(player.id)
    const totalStolen = robberyStats?.totalStolen ?? 0n

    const russianRole = RoleLabels[player.role as Role]
    const displayName = player.username ?? targetTgUser.first_name
    const regDate = player.createdAt.toLocaleDateString('ru-RU')

    const profileText = [
      UI.header(displayName, targetTgUser.id, 'игровой профиль', '👤'),
      '🆔 ID:',
      `      \`${player.id}\``,
      '🎭 Статус:',
      `      _${russianRole}_`,
      '💰 Баланс:',
      `      _${formatMoney(player.bankAccount?.balance || 0n)}_`,
      '🥷 Украдено:',
      `      _${formatMoney(totalStolen)}_`,
      '📅 Дата рег:',
      `      _${regDate}_`,
    ].join('\n')

    await ctx.smartReply(profileText, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('Ошибка в profile хендлере:', error)
    await ctx.smartReply(UI.error('Не удалось загрузить профиль. Попробуйте позже.'))
  }
})