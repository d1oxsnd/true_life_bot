import { Composer } from 'grammy'
import { Role } from '../../generated/prisma/client.js'
import {
  GAME_ROLES_CONFIG,
  ROLE_WEIGHTS,
  getNextRole,
  canUpgrade,
} from '../../lib/roles.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import type { MyContext } from '../../types/context.js'
import { formatMoney } from '../../utils/money.formatter.js'
import { UI } from '../../ui/theme.js'

export const statusComposer = new Composer<MyContext>()

statusComposer.hears(/^статус$/i, authMiddleware, async ctx => {
  if (!ctx.user) return

  const currentRole = ctx.user.role as Role
  const currentWeight = ROLE_WEIGHTS[currentRole] ?? 0

  let text = `Доступные игровые статусы\n\n`

  Object.values(GAME_ROLES_CONFIG).forEach(info => {
    if (info.role === Role.BOMZH) return

    const isCurrent = info.role === currentRole
    const infoWeight = ROLE_WEIGHTS[info.role] ?? 0
    const isUnlocked = infoWeight <= currentWeight

    const priceText = info.price > 0n ? formatMoney(info.price) : 'Бесплатно'
    const labelText = isCurrent ? `*${info.label} 👈 — сейчас*` : info.label

    const formattedDescription = info.description
      .split(',')
      .map(item => {
        const trimmed = item.trim()
        return isUnlocked ? `\`${trimmed}\`` : `_${trimmed}_`
      })
      .join('\n            ')

    text += `${labelText}\n`
    text += `      💵 Цена: _${priceText}_\n`
    text += `      ⚙️ Команды: \n            ${formattedDescription}\n\n`
  })

  text += UI.guide('💡', 'Чтобы повысить статус', 'статус поднять')

  await ctx.smartReply(text, { parse_mode: 'Markdown' })
})

statusComposer.hears(/^статус\s+(поднять|повысить|ап|купить)$/i, authMiddleware, async ctx => {
  if (!ctx.user || !ctx.from) return

  const currentRole = ctx.user.role as Role

  if (!canUpgrade(currentRole)) {
    return await ctx.smartReply(
      UI.error('Максимальный статус!', 'Ждите новые обновления :D')
    )
  }

  const nextRole = getNextRole(currentRole)
  if (!nextRole) {
    return await ctx.smartReply(UI.error('Следующий статус не найден.'))
  }

  const nextConfig = GAME_ROLES_CONFIG[nextRole]
  if (!nextConfig) {
    return await ctx.smartReply(UI.error('Конфигурация для следующего статуса не найдена.'))
  }

  const upgradePrice = nextConfig.price

  try {
    const paymentResult = await ctx.services.bank.payForRoleUpgrade(
      ctx.user.id,
      upgradePrice,
      nextConfig.role,
    )

    if (!paymentResult.success) {
      if (paymentResult.error === 'NOT_ENOUGH_MONEY') {
        const currentBalance = ctx.user.bankAccount?.balance || 0n
        const missing = upgradePrice > currentBalance ? upgradePrice - currentBalance : 0n

        return await ctx.smartReply(
          UI.error(
            'Недостаточно средств!',
            `Для статуса _${nextConfig.label}_ не хватает 💵 _${formatMoney(missing)}_`
          ),
          { parse_mode: 'Markdown' },
        )
      }

      return await ctx.smartReply(UI.error('Не удалось выполнить транзакцию. Попробуйте позже.'))
    }

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username,
        userId: ctx.from.id,
        action: `повысил статус до _${nextConfig.label}_`,
        icon: '🎉',
        statusTitle: 'Списано за покупку',
        money: { amount: upgradePrice, sign: '-' },
      }),
      { parse_mode: 'Markdown' },
    )
  } catch (error) {
    console.error('Ошибка при повышении статуса:', error)
    await ctx.smartReply(UI.error('Произошла ошибка при покупке статуса. Попробуйте позже.'))
  }
})