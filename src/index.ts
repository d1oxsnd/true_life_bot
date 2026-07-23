import 'dotenv/config'
import { Bot } from 'grammy'

import type { MyContext } from './types/context.js'
import { UserRepository } from './repositories/user.repository.js'
import { BankRepository } from './repositories/bank.repository.js'
import { UserService } from './services/user.service.js'
import { BankService } from './services/bank.service.js'
import { startComposer } from './commands/start/start.composer.js'
import { profileComposer } from './commands/profile/profile.composer.js'
import { statusComposer } from './commands/status/status.composer.js'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
if (!TELEGRAM_BOT_TOKEN) throw new Error('Ошибочка: В .env не задан TELEGRAM_BOT_TOKEN!')

const userRepo = new UserRepository()
const bankRepo = new BankRepository()

const bankService = new BankService(bankRepo)
const userService = new UserService(userRepo)

const services = {
  user: userService,
  bank: bankService,
}


const bot = new Bot<MyContext>(TELEGRAM_BOT_TOKEN)

bot.use(async (ctx, next) => {
  ctx.services = services

  ctx.smartReply = (text, other) => {
    const messageId = ctx.message?.message_id
    return ctx.reply(text, {
      ...other,
      ...(messageId ? { reply_parameters: { message_id: messageId } } : {}),
    })
  }

  await next()
})

bot.use(startComposer)
bot.use(profileComposer)
bot.use(statusComposer)

bot.start({
  onStart: (botInfo) => {
    console.log(`🚀 Бот @${botInfo.username} успешно запущен!`)
  },
})