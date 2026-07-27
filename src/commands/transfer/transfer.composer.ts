import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { parseMoney } from '../../utils/money.formatter.js'
import { UI } from '../../ui/theme.js'
import type { UserWithBank } from '../../repositories/user.repository.js'

export const transferComposer = new Composer<MyContext>()

transferComposer.hears(
  /^(?:перевести|перевод|передать|дать)(?:\s+(.+))?$/i,
  authMiddleware,
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const replyMessage = ctx.message?.reply_to_message
    const senderBalance = ctx.user.bankAccount?.balance ?? 0n

    let recipient: UserWithBank | null = null
    let recipientTgUser: { id: number; first_name: string; username?: string } | null = null
    let amountStr = ''

    if (replyMessage && replyMessage.from) {
      const replyUser = replyMessage.from

      if (replyUser.is_bot) {
        return await ctx.smartReply(UI.error('Нельзя переводить деньги боту!'))
      }

      if (replyUser.id === ctx.from.id) {
        return await ctx.smartReply(UI.error('Нельзя переводить деньги самому себе!'))
      }

      if (!rawMatch || !rawMatch.trim()) {
        return await ctx.smartReply(
          UI.guide('💸', 'Чтобы перевести деньги в ответ на сообщение', 'перевести [сумма]'),
          { parse_mode: 'Markdown' },
        )
      }

      amountStr = rawMatch.trim()
      recipientTgUser = replyUser
      recipient = await ctx.services.user.getOrCreateUser(BigInt(replyUser.id))
    } 
    else {
      if (!rawMatch || !rawMatch.trim()) {
        return await ctx.smartReply(
          UI.guide(
            '💸',
            'Чтобы перевести деньги',
            'перевести [ID] [сумма]',
            'или `перевести [сумма]` в ответ на сообщение',
          ),
          { parse_mode: 'Markdown' },
        )
      }

      const tokens = rawMatch.trim().split(/\s+/)
      if (tokens.length < 2) {
        return await ctx.smartReply(
          UI.error(
            'Укажите ID получателя и сумму!',
            '👉 Примеры:\n' +
              '            `перевести txN-YDx 500`\n' +
              '            `перевести все` (в ответ на сообщение)',
          ),
          { parse_mode: 'Markdown' },
        )
      }

      const targetInput = tokens[0]
      if (!targetInput) {
        return await ctx.smartReply(UI.error('Укажите ID получателя!'))
      }

      amountStr = tokens.slice(1).join(' ')

      recipient = await ctx.services.user.getUserById(targetInput)

      if (recipient) {
        recipientTgUser = {
          id: Number(recipient.telegramId),
          first_name: recipient.username ?? recipient.id,
          username: recipient.username ?? undefined,
        }
      }

      if (!recipient || !recipientTgUser) {
        return await ctx.smartReply(UI.error('Пользователь с таким ID не найден!'))
      }

      if (recipient.id === ctx.user.id) {
        return await ctx.smartReply(UI.error('Нельзя переводить деньги самому себе!'))
      }
    }

    let transferAmount: bigint
    if (/^(все|всё|all)$/i.test(amountStr)) {
      transferAmount = senderBalance
    } else {
      const parsedNumber = parseMoney(amountStr)

      if (parsedNumber === null) {
        return await ctx.smartReply(
          UI.error(
            'Укажите корректную сумму!',
            '👉 Примеры сумм:\n' +
              '            `перевести 500`\n' +
              '            `перевести 1.5к`\n' +
              '            `перевести 2.5м`\n' +
              '            `перевести все`',
          ),
          { parse_mode: 'Markdown' },
        )
      }

      transferAmount = BigInt(parsedNumber)
    }

    if (transferAmount <= 0n) {
      return await ctx.smartReply(UI.error('Сумма перевода должна быть больше 0!'))
    }

    if (senderBalance < transferAmount) {
      return await ctx.smartReply(
        UI.insufficientFunds(senderBalance),
        { parse_mode: 'Markdown' },
      )
    }

    const result = await ctx.services.bank.transferMoney(ctx.user.id, recipient.id, transferAmount)

    if (!result.success) {
      if (result.error === 'NOT_ENOUGH_MONEY') {
        return await ctx.smartReply(UI.insufficientFunds(senderBalance), { parse_mode: 'Markdown' })
      }
      return await ctx.smartReply(UI.error('Не удалось выполнить перевод. Попробуйте позже.'))
    }

    const recipientMention = `[${recipientTgUser.username ?? recipientTgUser.first_name}](tg://user?id=${recipientTgUser.id})`

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username ?? ctx.from.first_name,
        userId: ctx.from.id,
        action: `перевёл деньги получателю ${recipientMention}`,
        icon: '💸',
        statusTitle: 'Отправлено',
        money: { amount: transferAmount, sign: '-' },
      }),
      { parse_mode: 'Markdown' },
    )
  },
)
