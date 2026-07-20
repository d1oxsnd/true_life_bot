import type { CommandContext, Context } from 'grammy'
import type { GameService } from '../services/game.service.js'
import { RoleLabels } from '../utils/roles.js'

export class UserHandler {
	constructor(private gameService: GameService) {}

	/**
	 * Обработчик команды /start
	 */
	async onStart(ctx: CommandContext<Context>): Promise<void> {
		if (!ctx.from) return

		try {
			const telegramId = BigInt(ctx.from.id)
			const player = await this.gameService.handlePlayerLogin(telegramId)

			const russianRole = RoleLabels[player.role]

			await ctx.reply(
				`*Добро пожаловать в True Life, ${player.username}!*\n` +
					`🆔 Твой игровой ID:\n` +
					`\`${player.id}\`\n` +
					`🎭 Твой статус:\n` +
					`*${russianRole}*\n` +
					`💰 Баланс в банке:\n` +
					`\`$${player.bankAccount?.balance ?? 0}\`\n\n` +
					`Напиши \`помощь\` для просмотра всех команд`,
				{ parse_mode: 'Markdown' },
			)
		} catch (error) {
			console.error('Ошибка в onStart хендлере:', error)
			await ctx.reply('⚠️ Произошла ошибка при инициализации персонажа. Попробуйте позже.')
		}
	}
}
