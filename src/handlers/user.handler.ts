import type { CommandContext, Context } from 'grammy'
import {
  GameService,
  NICKNAME_CHANGE_COST,
  MIN_NICKNAME_LENGTH,
  MAX_NICKNAME_LENGTH,
} from '../services/game.service.js'
import { RoleLabels } from '../utils/roles.js'
import { formatMoney } from '../utils/formatter.js'

export class UserHandler {
  constructor(private gameService: GameService) {}

  /**
   * Обработчик команды /start
   */
  async onStart(ctx: CommandContext<Context>): Promise<void> {
    if (!ctx.from) return

    try {
      const telegramId = BigInt(ctx.from.id)
      await this.gameService.handlePlayerLogin(telegramId)

      await ctx.reply(
        `🌆 *Добро пожаловать в True Life!* \n\n` +
          `Это симулятор виртуальной жизни в твоем Telegram. Развивай персонажа, зарабатывай деньги, покупай бизнесы и поднимай свой статус от Бомжа до Бизнесмена! 🚀\n\n` +
          `Напиши \`помощь\` для просмотра всех доступных команд.`,
        { parse_mode: 'Markdown' },
      )
    } catch (error) {
      console.error('Ошибка в onStart хендлере:', error)
      await ctx.reply('⚠️ Произошла ошибка при запуске бота. Попробуйте позже.')
    }
  }

  /**
   * Обработчик текстовой команды "профиль"
   */
  async onProfile(ctx: Context): Promise<void> {
    if (!ctx.from) return

    try {
      const telegramId = BigInt(ctx.from.id)
      const player = await this.gameService.handlePlayerLogin(telegramId)
      const russianRole = RoleLabels[player.role]

      const userMention = `[${player.username}](tg://user?id=${ctx.from.id})`

      await ctx.reply(
        `${userMention}, игровой профиль: \n` +
          `🆔 ID:\n` +
          `       \`${player.id}\`\n` +
          `🎭 Статус:\n` +
          `       _${russianRole}_\n` +
          `💰 Баланс:\n` +
          `       _${formatMoney(player.bankAccount?.balance || 0)}_\n` +
          `📅 Дата рег:\n` +
          `       _${player.createdAt.toLocaleDateString('ru-RU')}_\n`,
        { parse_mode: 'Markdown' },
      )
    } catch (error) {
      console.error('Ошибка в onProfile хендлере:', error)
      await ctx.reply('⚠️ Не удалось загрузить профиль. Попробуйте позже.')
    }
  }

  /**
   * Команда "никнейм [новый_ник]"
   */
  async onChangeNickname(ctx: Context): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return

    try {
      const text = ctx.message.text.trim()
      const parts = text.split(/\s+/)
      const newNickname = parts.slice(1).join(' ')

      // Без аргумента -> выводим инструкцию с динамическими значениями
      if (!newNickname) {
        const formattedCost = formatMoney(NICKNAME_CHANGE_COST)

        await ctx.reply(
          `✏️ Чтобы сменить никнейм:\n` +
            `       \`никнейм [новый никнейм]\`\n` +
            `💵 Стоимость смены:\n` +
            `       _${formattedCost}_\n` +
            `📏 Длина:\n` +
            `       _от ${MIN_NICKNAME_LENGTH} до ${MAX_NICKNAME_LENGTH} символов_\n` +
            `🔒 Все никнеймы _уникальны_!\n`,
          { parse_mode: 'Markdown' },
        )
        return
      }

      const telegramId = BigInt(ctx.from.id)
      const result = await this.gameService.changeUsername(telegramId, newNickname)

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
          await ctx.reply(
            `⚠️ Ошибка смены ника:\n` +
              `       _игровой аккаунт не найден_\n`,
            { parse_mode: 'Markdown' },
          )
          break

        case 'INVALID_LENGTH':
          await ctx.reply(
            `⚠️ Некорректная длина никнейма:\n` +
              `       _допустимо 📏 от ${MIN_NICKNAME_LENGTH} до ${MAX_NICKNAME_LENGTH} символов_\n`,
            { parse_mode: 'Markdown' },
          )
          break

        case 'NICKNAME_TAKEN':
          await ctx.reply(
            `🚩 Никнейм _${newNickname.trim()}_ занят!`,
            { parse_mode: 'Markdown' },
          )
          break

        case 'INSUFFICIENT_FUNDS':
          await ctx.reply(
            `🤏 Недостаточно средств:\n` +
              `       _смена ника стоит 💵 ${formatMoney(NICKNAME_CHANGE_COST)}_\n`,
            { parse_mode: 'Markdown' },
          )
          break
      }
    } catch (error) {
      console.error('Ошибка в onChangeNickname хендлере:', error)
      await ctx.reply(
        `⚠️ Системная ошибка:\n` +
          `       _Не удалось сменить никнейм. Попробуйте позже_\n`,
        { parse_mode: 'Markdown' },
      )
    }
  }
}