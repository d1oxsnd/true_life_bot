import 'dotenv/config'
import { Bot } from 'grammy'

import type { MyContext } from './types/context.js'
import { UserRepository } from './repositories/user.repository.js'
import { BankRepository } from './repositories/bank.repository.js'
import { UserService } from './services/user.service.js'
import { BankService } from './services/bank.service.js'
import { AdminService } from './services/admin.service.js'
import { startComposer } from './commands/start/start.composer.js'
import { profileComposer } from './commands/profile/profile.composer.js'
import { statusComposer } from './commands/status/status.composer.js'
import { RobberyRepository } from './repositories/robbery.repository.js'
import { RobberyService } from './services/robbery.service.js'
import { robberyComposer } from './commands/robbery/robbery.composer.js'
import { SlotsService } from './commands/slots/slots.service.js'
import { slotsComposer } from './commands/slots/slots.composer.js'
import { WorkRepository } from './repositories/work.repository.js'
import { WorkService } from './services/work.service.js'
import { workComposer } from './commands/work/work.composer.js'
import { transferComposer } from './commands/transfer/transfer.composer.js'
import { adminComposer } from './commands/admin/admin.composer.js'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
if (!TELEGRAM_BOT_TOKEN) throw new Error('Ошибочка: В .env не задан TELEGRAM_BOT_TOKEN!')

const userRepo = new UserRepository()
const bankRepo = new BankRepository()
const robberyRepo = new RobberyRepository()
const workRepo = new WorkRepository()

const bankService = new BankService(bankRepo)
const userService = new UserService(userRepo)
const robberyService = new RobberyService(robberyRepo)
const slotsService = new SlotsService()
const workService = new WorkService(workRepo, bankService)
const adminService = new AdminService(userRepo, bankRepo)

const services = {
  user: userService,
  bank: bankService,
  robbery: robberyService,
  slots: slotsService,
  work: workService,
  admin: adminService,
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
bot.use(robberyComposer)
bot.use(slotsComposer)
bot.use(workComposer)
bot.use(transferComposer)
bot.use(adminComposer)

bot.start({
  onStart: (botInfo) => {
    console.log(`🚀 Бот @${botInfo.username} успешно запущен!`)
  },
})