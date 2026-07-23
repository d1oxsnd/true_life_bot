import { Composer } from 'grammy'
import { RoleLabels } from '../../lib/roles.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import type { MyContext } from '../../types/context.js'
import { formatMoney } from '../../utils/money.formatter.js'
import { getTargetPlayer } from '../../utils/user.extractor.js'
import type { Role } from '../../generated/prisma/enums.js'

export const profileComposer = new Composer<MyContext>()
profileComposer.hears(
	/^профиль$/i,
	authMiddleware,
	async ctx => {
		if (!ctx.user || !ctx.from) return

		try {
			const targetData = await getTargetPlayer(ctx)
			if (!targetData) return

			const { player, targetTgUser } = targetData

			const russianRole = RoleLabels[player.role as Role]
			const displayName = player.username ?? targetTgUser.first_name
			const userMention = `[${displayName}](tg://user?id=${targetTgUser.id})`

			await ctx.smartReply(
				`${userMention},\n` +`игровой профиль\n` +
					`🆔 ID:\n` +
					`       \`${player.id}\`\n` +
					`🎭 Статус:\n` +
					`       _${russianRole}_\n` +
					`💰 Баланс:\n` +
					`       _${formatMoney(player.bankAccount?.balance || 0n)}_\n` +
					`📅 Дата рег:\n` +
					`       _${player.createdAt.toLocaleDateString('ru-RU')}_\n`,
				{ parse_mode: 'Markdown' },
			)
		} catch (error) {
			console.error('Ошибка в profile хендлере:', error)
			await ctx.smartReply('⚠️ Не удалось загрузить профиль. Попробуйте позже.')
		}
	},
)
