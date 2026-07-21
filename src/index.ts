import { Bot } from 'grammy'
import { UserRepository } from './repositories/user.js'
import { UserService } from './services/user.service.js'
import { AdminService } from './services/admin.service.js'
import { PermissionService } from './services/permission.service.js'

import { GuardMiddleware } from './handlers/guards.js'
import { UserHandler } from './handlers/user.handler.js'
import { ProfileHandler } from './handlers/profile.handler.js'
import { AdminHandler } from './handlers/admin.handler.js'
import { Role } from './generated/prisma/client.js'

const token = process.env.BOT_TOKEN
if (!token) throw new Error('Ошибочка: В .env не задан BOT_TOKEN!')

// 1. Инициализация слоя доступа к данным
const userRepo = new UserRepository()

// 2. Инициализация слоя сервисов
const userService = new UserService(userRepo)
const adminService = new AdminService(userRepo)
const permissionService = new PermissionService(userRepo)

// 3. Инициализация слоя UI/Хендлеров
const guard = new GuardMiddleware(permissionService)
const userHandler = new UserHandler(userService)
const profileHandler = new ProfileHandler(userService)
const adminHandler = new AdminHandler(adminService)

const bot = new Bot(token)

// ==========================================
// РЕГИСТРАЦИЯ КОМАНД
// ==========================================

// Пользовательские команды
bot.command('start', (ctx) => userHandler.onStart(ctx))
bot.hears(/^профиль$/i, (ctx) => userHandler.onProfile(ctx))
bot.hears(/^никнейм(\s+.*)?$/i, (ctx) => profileHandler.onChangeNickname(ctx))

// Админские команды
bot.command(
  'changeid',
  guard.requireRole(Role.ADMIN),
  (ctx) => adminHandler.onChangeId(ctx)
)

console.log('🚀 Бот True Life успешно запущен!')
bot.start()