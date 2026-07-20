import type { CommandContext, Context } from 'grammy'
import type { GameService } from '../services/game.service.js'
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
					`       ${russianRole}\n` +
					`💰 Баланс:\n` +
					`       \`${formatMoney(player.bankAccount?.balance || 0)}\``,
				{ parse_mode: 'Markdown' },
			)
		} catch (error) {
			console.error('Ошибка в onProfile хендлере:', error)
			await ctx.reply('⚠️ Не удалось загрузить профиль. Попробуйте позже.')
		}
	}
}
