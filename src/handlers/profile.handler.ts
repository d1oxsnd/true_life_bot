import type { Context } from 'grammy'
import type { UserService } from '../services/user.service.js'
import { GAME_CONFIG } from '../configs/constants.js'
import { formatMoney } from '../utils/formatter.js'

export class ProfileHandler {
  constructor(private userService: UserService) {}

  async onChangeNickname(ctx: Context): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return

    try {
      const text = ctx.message.text.trim()
      const parts = text.split(/\s+/)
      const newNickname = parts.slice(1).join(' ')

      if (!newNickname) {
        const formattedCost = formatMoney(GAME_CONFIG.NICKNAME.COST)

        await ctx.reply(
          `✏️ Чтобы сменить никнейм:\n` +
            `       \`никнейм [новый никнейм]\`\n` +
            `💵 Стоимость смены:\n` +
            `       _${formattedCost}_\n` +
            `📏 Длина:\n` +
            `       _от ${GAME_CONFIG.NICKNAME.MIN_LENGTH} до ${GAME_CONFIG.NICKNAME.MAX_LENGTH} символов_\n` +
            `🔒 Все никнеймы _уникальны_!\n`,
          { parse_mode: 'Markdown' },
        )
        return
      }

      const telegramId = BigInt(ctx.from.id)
      const result = await this.userService.changeUsername(telegramId, newNickname)

      if (result.success) {
        const formattedCost = formatMoney(result.cost)
        await ctx.reply(
          `🎉 Никнейм изменен\n` +
            `       на ✏️ _${result.newUsername}_\n` +
            `              _и 💵 -${formattedCost} списано_`,
          { parse_mode: 'Markdown' },
        )
        return
      }

      switch (result.reason) {
        case 'ACCOUNT_NOT_FOUND':
          await ctx.reply(`⚠️ Ошибка смены ника:\n       _игровой аккаунт не найден_\n`, { parse_mode: 'Markdown' })
          break
        case 'INVALID_LENGTH':
          await ctx.reply(`⚠️ Некорректная длина никнейма:\n       _допустимо 📏 от ${GAME_CONFIG.NICKNAME.MIN_LENGTH} до ${GAME_CONFIG.NICKNAME.MAX_LENGTH} символов_\n`, { parse_mode: 'Markdown' })
          break
        case 'NICKNAME_TAKEN':
          await ctx.reply(`🚩 Никнейм _${newNickname.trim()}_ занят!`, { parse_mode: 'Markdown' })
          break
        case 'INSUFFICIENT_FUNDS':
          await ctx.reply(`🤏 Недостаточно средств:\n       _смена ника стоит 💵 ${formatMoney(GAME_CONFIG.NICKNAME.COST)}_\n`, { parse_mode: 'Markdown' })
          break
      }
    } catch (error) {
      console.error('Ошибка в onChangeNickname хендлере:', error)
      await ctx.reply(`⚠️ Системная ошибка:\n       _Не удалось сменить никнейм. Попробуйте позже_\n`, { parse_mode: 'Markdown' })
    }
  }
}