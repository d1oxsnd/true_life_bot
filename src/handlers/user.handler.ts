import type { CommandContext, Context } from 'grammy'
import type { UserService } from '../services/user.service.js'
import { RoleLabels } from '../utils/roles.js'
import { formatMoney } from '../utils/formatter.js'

export class UserHandler {
  constructor(private userService: UserService) {}

  async onStart(ctx: CommandContext<Context>): Promise<void> {
    if (!ctx.from) return

    try {
      const telegramId = BigInt(ctx.from.id)
      await this.userService.handlePlayerLogin(telegramId)

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

  async onProfile(ctx: Context): Promise<void> {
    if (!ctx.from) return

    try {
      const telegramId = BigInt(ctx.from.id)
      const player = await this.userService.handlePlayerLogin(telegramId)
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
}