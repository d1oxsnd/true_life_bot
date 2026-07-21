import { Bot } from 'grammy'
import { UserRepository } from './repositories/user.js'
import { GameService } from './services/game.service.js'
import { GuardMiddleware } from './handlers/guards.js'
import { UserHandler } from './handlers/user.handler.js'

const token = process.env.BOT_TOKEN
if (!token) {
	throw new Error('Ошибка: В .env не задан BOT_TOKEN!')
}

const userRepository = new UserRepository()
const gameService = new GameService(userRepository)

const guard = new GuardMiddleware(gameService)
const userHandler = new UserHandler(gameService)

const bot = new Bot(token)

bot.command('start', (ctx) => userHandler.onStart(ctx))

bot.hears(/^профиль$/i, (ctx) => userHandler.onProfile(ctx))

bot.hears(/^никнейм(\s+.*)?$/i, (ctx) => userHandler.onChangeNickname(ctx))

console.log('Бот True Life успешно запущен в режиме Long Polling...')
bot.start()
