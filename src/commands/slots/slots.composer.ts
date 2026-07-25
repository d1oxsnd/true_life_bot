import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { formatMoney, parseMoney } from '../../utils/money.formatter.js'

export const slotsComposer = new Composer<MyContext>()

slotsComposer.hears(/^(?:слоты|слот)(?:\s+(.+))?$/i, authMiddleware, async ctx => {
	if (!ctx.user || !ctx.from || !ctx.match) return

	const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]

	if (!rawMatch || !rawMatch.trim()) {
		return await ctx.smartReply(`🎰 Чтобы сыграть в слоты:\n` + `      ⚙️ \`слоты [сумма]\``, {
			parse_mode: 'Markdown',
		})
	}

	const inputAmount = rawMatch.trim()
	const balance = ctx.user.bankAccount?.balance ?? 0n

	let betAmount: bigint
	if (/^(все|всё|all)$/i.test(inputAmount)) {
		betAmount = balance
	} else {
		const parsedNumber = parseMoney(inputAmount)

		if (parsedNumber === null) {
			return await ctx.smartReply(
				'❌ Укажите корректную сумму!\n' +
				`      👉 Примеры сумм:\n` +
					`            \`слоты 500\`\n` +
					`            \`слоты 1.5к\`\n` +
					`            \`слоты 2.5м\`\n` +
					`            \`слоты все\`\n`,
				{ parse_mode: 'Markdown' },
			)
		}

		betAmount = BigInt(parsedNumber)
	}

	if (betAmount <= 0n) {
		return await ctx.smartReply('❌ Ставка должна быть больше 0!')
	}

	if (balance < betAmount) {
		return await ctx.smartReply(
			`❌ У вас недостаточно средств!\n      Ваш баланс: _${formatMoney(balance)}_`,
			{ parse_mode: 'Markdown' },
		)
	}

	const combination = ctx.services.slots.spin()
	const multiplier = ctx.services.slots.calculateMultiplier(combination)

	const userMention = `[${ctx.user.username}](tg://user?id=${ctx.from.id})`
	const slotDisplay = `${combination.join('')}`

	if (multiplier === 0) {
		await ctx.services.bank.payMoney(ctx.user.id, betAmount)

		return await ctx.smartReply(
			`🎰 ${userMention},`+`\nкрутим слоты:\n` +
			`      ${slotDisplay} _(x${multiplier})_\n` +
				`Потеряно:\n`+`      💵 _-${formatMoney(betAmount)}_`,
			{ parse_mode: 'Markdown' },
		)
	}

	const winAmount = (betAmount * BigInt(Math.floor(multiplier * 10))) / 10n
	const netProfit = winAmount - betAmount

	if (netProfit > 0n) {
		await ctx.services.bank.getMoney(ctx.user.id, netProfit)
	} else if (netProfit < 0n) {
		await ctx.services.bank.payMoney(ctx.user.id, -netProfit)
	}

	const winHeader = multiplier >= 7 ? 'ДЖЕКПОТ' : 'Выигрыш'

	return await ctx.smartReply(
			`🎰 ${userMention},`+`\nкрутим слоты:\n` +
			`      ${slotDisplay} _(x${multiplier})_\n` +
			`${winHeader}:\n`+`      💵 _+${formatMoney(winAmount)}_`,
		{ parse_mode: 'Markdown' },
	)
})
