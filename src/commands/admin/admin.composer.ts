import { Composer } from 'grammy'
import type { MyContext } from '../../types/context.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { Role } from '../../generated/prisma/enums.js'
import { RoleLabels, hasPermission } from '../../lib/roles.js'
import { formatMoney, parseMoney } from '../../utils/money.formatter.js'
import { UI } from '../../ui/theme.js'
import { extractTargetPlayer } from '../../utils/user.extractor.js'

export const adminComposer = new Composer<MyContext>()

// ------------------------------------------------------------------
// 1. /givemoney <target> <amount>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/givemoney(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.ADMIN, '/givemoney'),
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error(
          'Ошибка вызова команды!',
          `${extracted.error}\n👉 Пример: \`/givemoney txN-YDx 100k\``,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const { player: targetUser, remainingText } = extracted.target

    if (!remainingText) {
      return await ctx.smartReply(
        UI.error(
          'Укажите сумму!',
          '👉 Примеры:\n' +
            '            `/givemoney txN-YDx 100k`\n' +
            '            `/givemoney 5000` (в ответ на сообщение)',
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const parsedNumber = parseMoney(remainingText)
    if (parsedNumber === null) {
      return await ctx.smartReply(UI.error('Укажите корректную сумму!'))
    }

    const giveAmount = BigInt(parsedNumber)
    if (giveAmount <= 0n) {
      return await ctx.smartReply(UI.error('Сумма должна быть больше 0!'))
    }

    const updatedUser = await ctx.services.admin.giveMoney(targetUser.id, giveAmount)
    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username ?? ctx.from.first_name,
        userId: ctx.from.id,
        action: `начислил деньги игроку ${recipientMention} (\`${updatedUser.id}\`)`,
        icon: '💳',
        statusTitle: 'Начислено',
        money: { amount: giveAmount, sign: '+' },
      }),
      { parse_mode: 'Markdown' },
    )
  },
)

// ------------------------------------------------------------------
// 2. /takemoney <target> <amount/all>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/takemoney(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.ADMIN, '/takemoney'),
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error(
          'Ошибка вызова команды!',
          `${extracted.error}\n👉 Пример: \`/takemoney txN-YDx 50k\``,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const { player: targetUser, remainingText } = extracted.target

    if (!remainingText) {
      return await ctx.smartReply(
        UI.error(
          'Укажите сумму для списания!',
          '👉 Примеры:\n' +
            '            `/takemoney txN-YDx 50k`\n' +
            '            `/takemoney all` (в ответ на сообщение)',
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const recipientMention = `[${targetUser.username}](tg://user?id=${targetUser.telegramId})`

    if (/^(all|все|всё)$/i.test(remainingText.trim())) {
      await ctx.services.admin.takeMoney(targetUser.id, 'all')
      return await ctx.smartReply(
        UI.actionCard({
          username: ctx.user.username ?? ctx.from.first_name,
          userId: ctx.from.id,
          action: `полностью обнулил баланс игроку ${recipientMention} (\`${targetUser.id}\`)`,
          icon: '🧹',
          statusTitle: 'Баланс сброшен',
          content: '      💵 _0_',
        }),
        { parse_mode: 'Markdown' },
      )
    }

    const parsedNumber = parseMoney(remainingText)
    if (parsedNumber === null) {
      return await ctx.smartReply(UI.error('Укажите корректную сумму!'))
    }

    const takeAmount = BigInt(parsedNumber)
    if (takeAmount <= 0n) {
      return await ctx.smartReply(UI.error('Сумма должна быть больше 0!'))
    }

    await ctx.services.admin.takeMoney(targetUser.id, takeAmount)

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username ?? ctx.from.first_name,
        userId: ctx.from.id,
        action: `списал деньги у игрока ${recipientMention} (\`${targetUser.id}\`)`,
        icon: '📉',
        statusTitle: 'Списано',
        money: { amount: takeAmount, sign: '-' },
      }),
      { parse_mode: 'Markdown' },
    )
  },
)

// ------------------------------------------------------------------
// 3. /setrole <target> <role>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/setrole(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.ADMIN, '/setrole'),
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error(
          'Ошибка вызова команды!',
          `${extracted.error}\n👉 Пример: \`/setrole txN-YDx BUSINESS_PLUS\``,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const { player: targetUser, remainingText } = extracted.target

    if (!remainingText) {
      return await ctx.smartReply(
        UI.error(
          'Укажите роль!',
          '👉 Доступные роли: `BOMZH`, `PLANKTON`, `BUSINESS_PLUS`, `MODERATOR`, `ADMIN`',
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const roleInput = remainingText.trim().toUpperCase()
    const validRoles = Object.values(Role)

    if (!validRoles.includes(roleInput as Role)) {
      return await ctx.smartReply(
        UI.error(
          'Указана некорректная роль!',
          `Допустимые роли: \`${validRoles.join('`, `')}\``,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const newRole = roleInput as Role
    const updatedUser = await ctx.services.admin.setRole(targetUser.id, newRole)

    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`
    const roleLabel = RoleLabels[newRole] ?? newRole

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username ?? ctx.from.first_name,
        userId: ctx.from.id,
        action: `изменил статус игроку ${recipientMention} (\`${updatedUser.id}\`)`,
        icon: '👑',
        statusTitle: 'Новый статус',
        content: `      *${roleLabel}* (\`${newRole}\`)`,
      }),
      { parse_mode: 'Markdown' },
    )
  },
)

// ------------------------------------------------------------------
// 4. /ban <target>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/ban(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/ban'),
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error(
          'Ошибка вызова команды!',
          `${extracted.error}\n👉 Пример: \`/ban txN-YDx\` или \`/ban\` (в ответ)`,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const { player: targetUser } = extracted.target

    if (hasPermission(targetUser.role, Role.ADMIN)) {
      return await ctx.smartReply(UI.error('Нельзя заблокировать Администратора!'))
    }

    const updatedUser = await ctx.services.admin.banUser(targetUser.id)
    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username ?? ctx.from.first_name,
        userId: ctx.from.id,
        action: `заблокировал доступ игроку ${recipientMention} (\`${updatedUser.id}\`)`,
        icon: '🚫',
        statusTitle: 'Статус блокировки',
        content: '      ⛔️ *Заблокирован*',
      }),
      { parse_mode: 'Markdown' },
    )
  },
)

// ------------------------------------------------------------------
// 5. /unban <target>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/unban(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/unban'),
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error(
          'Ошибка вызова команды!',
          `${extracted.error}\n👉 Пример: \`/unban txN-YDx\` или \`/unban\` (в ответ)`,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const { player: targetUser } = extracted.target
    const updatedUser = await ctx.services.admin.unbanUser(targetUser.id)

    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`

    return await ctx.smartReply(
      UI.actionCard({
        username: ctx.user.username ?? ctx.from.first_name,
        userId: ctx.from.id,
        action: `разблокировал доступ игроку ${recipientMention} (\`${updatedUser.id}\`)`,
        icon: '✅',
        statusTitle: 'Статус блокировки',
        content: '      🟢 *Активен*',
      }),
      { parse_mode: 'Markdown' },
    )
  },
)

// ------------------------------------------------------------------
// 6. /userinfo <target>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/userinfo(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/userinfo'),
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error(
          'Ошибка вызова команды!',
          `${extracted.error}\n👉 Пример: \`/userinfo txN-YDx\``,
        ),
        { parse_mode: 'Markdown' },
      )
    }

    const { player: targetUser } = extracted.target
    const info = await ctx.services.admin.getUserInfo(targetUser.id)

    if (!info) {
      return await ctx.smartReply(UI.error('Информация о пользователе не найдена!'))
    }

    const balance = info.bankAccount?.balance ?? 0n
    const roleLabel = RoleLabels[info.role as Role] ?? info.role
    const banStatus = info.isBanned ? '⛔️ *Заблокирован*' : '🟢 Активен'
    const regDate = info.createdAt.toISOString().split('T')[0]

    const message = [
      UI.header(ctx.user.username ?? ctx.from.first_name, ctx.from.id, 'системная информация о пользователе', '🔍'),
      `      👤 Пользователь: [${info.username}](tg://user?id=${info.telegramId})`,
      `      🆔 Внутренний ID: \`${info.id}\``,
      `      📱 Telegram ID: \`${info.telegramId}\``,
      `      👑 Роль: *${roleLabel}* (\`${info.role}\`)`,
      `      🛡 Статус: ${banStatus}`,
      `      💵 Баланс: _${formatMoney(balance)}_`,
      `      📅 Регистрация: \`${regDate}\``,
    ].join('\n')

    return await ctx.smartReply(message, { parse_mode: 'Markdown' })
  },
)

// ------------------------------------------------------------------
// 7. /adminhelp
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/adminhelp$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/adminhelp'),
  async ctx => {
    if (!ctx.user || !ctx.from) return

    const message = [
      UI.header(ctx.user.username ?? ctx.from.first_name, ctx.from.id, 'панель администрирования', '⚡️'),
      '👑 *Команды АДМИНИСТРАТОРА:*',
      '      `/givemoney <ID> <сумма>` — Начислить деньги игроку',
      '      `/takemoney <ID> <сумма/all>` — Списать деньги или обнулить',
      '      `/setrole <ID> <роль>` — Установить роль (`BOMZH`, `PLANKTON`, `BUSINESS_PLUS`, `MODERATOR`, `ADMIN`)',
      '',
      '🛡 *Команды МОДЕРАТОРА:*',
      '      `/ban <ID>` — Заблокировать доступ пользователю',
      '      `/unban <ID>` — Разблокировать доступ пользователю',
      '      `/userinfo <ID>` — Просмотр детальных данных пользователя',
      '      `/adminhelp` — Вызов этой справки',
      '',
      UI.guide('💡', 'Указание цели', '/givemoney txN-YDx 100k', 'или в ответ на сообщение'),
    ].join('\n')

    await ctx.smartReply(message, { parse_mode: 'Markdown' })
  },
)
