import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { formatMoney, parseMoney } from '../../utils/money.formatter.js'
import { UI } from '../../ui/theme.js'

export const slotsComposer = new Composer<MyContext>()

slotsComposer.hears(/^(?:слоты|слот)(?:\s+(.+))?$/i, authMiddleware, async ctx => {
  if (!ctx.user || !ctx.from || !ctx.match) return

  const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]

  // 1. Гайд, если ввели просто "слот"
  if (!rawMatch || !rawMatch.trim()) {
    return await ctx.smartReply(
      UI.guide('🎰', 'Чтобы сыграть в слоты', 'слоты [сумма]'),
      { parse_mode: 'Markdown' },
    )
  }

  const inputAmount = rawMatch.trim()
  const balance = ctx.user.bankAccount?.balance ?? 0n

  // 2. Парсинг суммы
  let betAmount: bigint
  if (/^(все|всё|all)$/i.test(inputAmount)) {
    betAmount = balance
  } else {
    const parsedNumber = parseMoney(inputAmount)

    if (parsedNumber === null) {
      return await ctx.smartReply(
        UI.error(
          'Укажите корректную сумму!',
          `👉 Примеры сумм:\n` +
            `            \`слоты 500\`\n` +
            `            \`слоты 1.5к\`\n` +
            `            \`слоты 2.5м\`\n` +
            `            \`слоты все\``,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    betAmount = BigInt(parsedNumber)
  }

  // 3. Валидация баланса
  if (betAmount <= 0n) {
    return await ctx.smartReply(UI.error('Ставка должна быть больше 0!'))
  }

  if (balance < betAmount) {
    return await ctx.smartReply(
      UI.insufficientFunds(balance),
      { parse_mode: 'Markdown' },
    )
  }

  // 4. Логика вращения
  const combination = ctx.services.slots.spin()
  const multiplier = ctx.services.slots.calculateMultiplier(combination)
  const slotDisplay = `${combination.join('')}`

  // 5. Поражение (x0)
  if (multiplier === 0) {
    await ctx.services.bank.payMoney(ctx.user.id, betAmount)

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username,
        userId: ctx.from.id,
        action: 'крутим слоты',
        icon: '🎰',
        content: `${slotDisplay} _(x${multiplier})_`,
        statusTitle: 'Потеряно',
        money: { amount: betAmount, sign: '-' },
      }),
      { parse_mode: 'Markdown' },
    )
  }

  // 6. Выигрыш
  const winAmount = (betAmount * BigInt(Math.floor(multiplier * 10))) / 10n
  const netProfit = winAmount - betAmount

  if (netProfit > 0n) {
    await ctx.services.bank.getMoney(ctx.user.id, netProfit)
  } else if (netProfit < 0n) {
    await ctx.services.bank.payMoney(ctx.user.id, -netProfit)
  }

  const winHeader = multiplier >= 7 ? 'ДЖЕКПОТ' : 'Выигрыш'

  return await ctx.smartReply(
    UI.actionCard({
      username: ctx.user.username,
      userId: ctx.from.id,
      action: 'крутим слоты',
      icon: '🎰',
      content: `${slotDisplay} _(x${multiplier})_`,
      statusTitle: winHeader,
      money: { amount: winAmount, sign: '+' },
    }),
    { parse_mode: 'Markdown' },
  )
})