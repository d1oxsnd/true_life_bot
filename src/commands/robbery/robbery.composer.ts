import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { formatMoney } from '../../utils/money.formatter.js'

export const robberyComposer = new Composer<MyContext>()

robberyComposer.hears(/^(ограбить|грабеж|спиздить)$/i, authMiddleware, async ctx => {
	if (!ctx.user || !ctx.from) return

	const replyMessage = ctx.message?.reply_to_message
	const victimTgUser = replyMessage?.from

	if (!replyMessage || !victimTgUser) {
		return await ctx.smartReply(
			`🏴‍☠️ Чтобы ограбить кого-то\n       ⚙️ \`ограбить\` в ответ на сообщение`,
			{ parse_mode: 'Markdown' },
		)
	}

	if (victimTgUser.is_bot) {
		return
	}

	if (victimTgUser.id === ctx.from.id) {
		return
	}

	const victim = await ctx.services.user.getOrCreateUser(BigInt(victimTgUser.id))
	const victimBalance = victim.bankAccount?.balance ?? 0n

	const result = await ctx.services.robbery.attemptRobbery(ctx.user.id, victim.id, victimBalance)

	const robberMention = `[${ctx.user.username}](tg://user?id=${ctx.from.id})`
	const victimMention = `[${victim.username}](tg://user?id=${victimTgUser.id})`

	if (!result.success) {
		if (result.reason === 'COOLDOWN') {
			const totalSeconds = Math.ceil(result.remainingMs / 1000)
			const hours = Math.floor(totalSeconds / 3600)
			const minutes = Math.floor((totalSeconds % 3600) / 60)

			return await ctx.smartReply(
				`🥷🏻⏳ ${robberMention}, надо залечь на дно!\n` +
					`Грабить можно через _${hours}ч. ${minutes}мин._`,
				{ parse_mode: 'Markdown' },
			)
		}

		if (result.reason === 'VICTIM_IS_POOR') {
			return await ctx.smartReply(
				`🥷🏻 ${robberMention} попытался\n`+`       ограбить БОМЖА ${victimMention} 🤣`,
				{ parse_mode: 'Markdown' },
			)
		}

		return await ctx.smartReply(
			`🥷🏻🚨 ${robberMention} попытался\n` +
				`       ограбить ${victimMention},\n` +
				`              но заиграли сирены`,
			{ parse_mode: 'Markdown' },
		)
	}

	const stolenAmount = result.stolenAmount ?? 0n
	const chanceStr = result.chance?.toFixed(1) ?? '10.0'

	return await ctx.smartReply(
		`🥷🏻🎊 ${robberMention} успешно \n       ограбил ${victimMention}\n` +
			`              на 💵 _${formatMoney(stolenAmount)}_`,
		{ parse_mode: 'Markdown' },
	)
})
