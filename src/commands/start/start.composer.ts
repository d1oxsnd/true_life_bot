import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'

export const startComposer = new Composer<MyContext>()

startComposer.command('start', authMiddleware, async ctx => {
	if (!ctx.from) return

	try {
		await ctx.smartReply(
			`🌆 *Добро пожаловать в True Life!*\n\n` +
				`Это симулятор виртуальной жизни в твоем Telegram. Развивай персонажа, зарабатывай деньги, покупай бизнесы и поднимай свой статус от Бомжа до Бизнесмена! 🚀\n\n` +
				`Напиши \`помощь\` для просмотра всех доступных команд.`,
			{ parse_mode: 'Markdown' },
		)
	} catch (error) {
		console.error('Ошибка в onStart хендлере:', error)
		await ctx.smartReply('⚠️ Произошла ошибка при запуске бота. Попробуйте позже.')
	}
})
