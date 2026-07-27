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
    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error('Command usage error', extracted.error + '\n\n👉 Example: `/givemoney txN-YDx 100k`'),
        { parse_mode: 'Markdown' }
      )
    }

    const { player: targetUser, remainingText } = extracted.target

    if (!remainingText) {
      return await ctx.smartReply(
        UI.error('Amount is missing!', '👉 Example: `/givemoney txN-YDx 100k` or `/givemoney 5000` (in reply)'),
        { parse_mode: 'Markdown' }
      )
    }

    const parsedNumber = parseMoney(remainingText)
    if (parsedNumber === null) {
      return await ctx.smartReply(UI.error('Invalid amount format!'))
    }

    const giveAmount = BigInt(parsedNumber)
    if (giveAmount <= 0n) {
      return await ctx.smartReply(UI.error('Amount must be greater than 0!'))
    }

    const updatedUser = await ctx.services.admin.giveMoney(targetUser.id, giveAmount)

    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`

    return await ctx.smartReply(
      `✅ *Granted money*\n\n` +
        `👤 User: ${recipientMention} (\`${updatedUser.id}\`)\n` +
        `💵 Added: _+${formatMoney(giveAmount)}_`,
      { parse_mode: 'Markdown' }
    )
  }
)

// ------------------------------------------------------------------
// 2. /takemoney <target> <amount/all>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/takemoney(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.ADMIN, '/takemoney'),
  async ctx => {
    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error('Command usage error', extracted.error + '\n\n👉 Example: `/takemoney txN-YDx 50k`'),
        { parse_mode: 'Markdown' }
      )
    }

    const { player: targetUser, remainingText } = extracted.target

    if (!remainingText) {
      return await ctx.smartReply(
        UI.error('Amount is missing!', '👉 Example: `/takemoney txN-YDx 50k` or `/takemoney all`'),
        { parse_mode: 'Markdown' }
      )
    }

    const recipientMention = `[${targetUser.username}](tg://user?id=${targetUser.telegramId})`

    if (/^(all|все|всё)$/i.test(remainingText.trim())) {
      await ctx.services.admin.takeMoney(targetUser.id, 'all')
      return await ctx.smartReply(
        `✅ *Cleared balance*\n\n` +
          `👤 User: ${recipientMention} (\`${targetUser.id}\`)\n` +
          `💵 Balance reset to: _0_`,
        { parse_mode: 'Markdown' }
      )
    }

    const parsedNumber = parseMoney(remainingText)
    if (parsedNumber === null) {
      return await ctx.smartReply(UI.error('Invalid amount format!'))
    }

    const takeAmount = BigInt(parsedNumber)
    if (takeAmount <= 0n) {
      return await ctx.smartReply(UI.error('Amount must be greater than 0!'))
    }

    await ctx.services.admin.takeMoney(targetUser.id, takeAmount)

    return await ctx.smartReply(
      `✅ *Deducted money*\n\n` +
        `👤 User: ${recipientMention} (\`${targetUser.id}\`)\n` +
        `💵 Subtracted: _-${formatMoney(takeAmount)}_`,
      { parse_mode: 'Markdown' }
    )
  }
)

// ------------------------------------------------------------------
// 3. /setrole <target> <role>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/setrole(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.ADMIN, '/setrole'),
  async ctx => {
    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error('Command usage error', extracted.error + '\n\n👉 Example: `/setrole txN-YDx BUSINESS_PLUS`'),
        { parse_mode: 'Markdown' }
      )
    }

    const { player: targetUser, remainingText } = extracted.target

    if (!remainingText) {
      return await ctx.smartReply(
        UI.error(
          'Role is missing!',
          '👉 Available roles: `BOMZH`, `PLANKTON`, `BUSINESS_PLUS`, `MODERATOR`, `ADMIN`'
        ),
        { parse_mode: 'Markdown' }
      )
    }

    const roleInput = remainingText.trim().toUpperCase()
    const validRoles = Object.values(Role)

    if (!validRoles.includes(roleInput as Role)) {
      return await ctx.smartReply(
        UI.error(
          'Invalid role specified!',
          `Available roles: \`${validRoles.join('`, `')}\``
        ),
        { parse_mode: 'Markdown' }
      )
    }

    const newRole = roleInput as Role
    const updatedUser = await ctx.services.admin.setRole(targetUser.id, newRole)

    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`
    const roleLabel = RoleLabels[newRole] ?? newRole

    return await ctx.smartReply(
      `👑 *Role Updated*\n\n` +
        `👤 User: ${recipientMention} (\`${updatedUser.id}\`)\n` +
        `🎭 New Role: *${roleLabel}* (\`${newRole}\`)`,
      { parse_mode: 'Markdown' }
    )
  }
)

// ------------------------------------------------------------------
// 4. /ban <target>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/ban(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/ban'),
  async ctx => {
    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error('Command usage error', extracted.error + '\n\n👉 Example: `/ban txN-YDx` or `/ban` (in reply)'),
        { parse_mode: 'Markdown' }
      )
    }

    const { player: targetUser } = extracted.target

    if (hasPermission(targetUser.role, Role.ADMIN)) {
      return await ctx.smartReply(UI.error('Cannot ban an Administrator!'))
    }

    const updatedUser = await ctx.services.admin.banUser(targetUser.id)

    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`

    return await ctx.smartReply(
      `🚫 *User Banned*\n\n` +
        `👤 User: ${recipientMention} (\`${updatedUser.id}\`)\n` +
        `⚠️ User has been blocked from using bot features.`,
      { parse_mode: 'Markdown' }
    )
  }
)

// ------------------------------------------------------------------
// 5. /unban <target>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/unban(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/unban'),
  async ctx => {
    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error('Command usage error', extracted.error + '\n\n👉 Example: `/unban txN-YDx` or `/unban` (in reply)'),
        { parse_mode: 'Markdown' }
      )
    }

    const { player: targetUser } = extracted.target

    const updatedUser = await ctx.services.admin.unbanUser(targetUser.id)

    const recipientMention = `[${updatedUser.username}](tg://user?id=${updatedUser.telegramId})`

    return await ctx.smartReply(
      `✅ *User Unbanned*\n\n` +
        `👤 User: ${recipientMention} (\`${updatedUser.id}\`)\n` +
        `🔓 Access to bot features has been restored.`,
      { parse_mode: 'Markdown' }
    )
  }
)

// ------------------------------------------------------------------
// 6. /userinfo <target>
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/userinfo(?:\s+(.+))?$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/userinfo'),
  async ctx => {
    const rawMatch = typeof ctx.match === 'string' ? ctx.match : ctx.match[1]
    const extracted = await extractTargetPlayer(ctx, rawMatch)

    if ('error' in extracted) {
      return await ctx.smartReply(
        UI.error('Command usage error', extracted.error + '\n\n👉 Example: `/userinfo txN-YDx`'),
        { parse_mode: 'Markdown' }
      )
    }

    const { player: targetUser } = extracted.target
    const info = await ctx.services.admin.getUserInfo(targetUser.id)

    if (!info) {
      return await ctx.smartReply(UI.error('User info not found!'))
    }

    const balance = info.bankAccount?.balance ?? 0n
    const roleLabel = RoleLabels[info.role as Role] ?? info.role
    const banStatus = info.isBanned ? '⛔️ *BANNED*' : '🟢 Active'
    const regDate = info.createdAt.toISOString().split('T')[0]

    return await ctx.smartReply(
      `🔍 *Admin User Info*\n\n` +
        `• *Internal ID:* \`${info.id}\`\n` +
        `• *Telegram ID:* \`${info.telegramId}\`\n` +
        `• *Username:* \`${info.username}\`\n` +
        `• *Role:* ${roleLabel} (\`${info.role}\`)\n` +
        `• *Status:* ${banStatus}\n` +
        `• *Balance:* 💵 _${formatMoney(balance)}_\n` +
        `• *Registered:* \`${regDate}\``,
      { parse_mode: 'Markdown' }
    )
  }
)

// ------------------------------------------------------------------
// 7. /adminhelp
// ------------------------------------------------------------------
adminComposer.hears(
  /^\/adminhelp$/i,
  authMiddleware,
  requireRole(Role.MODERATOR, '/adminhelp'),
  async ctx => {
    const text =
      `⚡️ *Admin Commands Panel*\n\n` +
      `👑 *ADMIN Commands:*\n` +
      `• \`/givemoney <ID> <amount>\` — Grant money to player\n` +
      `• \`/takemoney <ID> <amount/all>\` — Deduct money from player\n` +
      `• \`/setrole <ID> <role>\` — Change player role (\`BOMZH\`, \`PLANKTON\`, \`BUSINESS_PLUS\`, \`MODERATOR\`, \`ADMIN\`)\n\n` +
      `🛡 *MODERATOR Commands:*\n` +
      `• \`/ban <ID>\` — Ban user from using the bot\n` +
      `• \`/unban <ID>\` — Unban user\n` +
      `• \`/userinfo <ID>\` — View full diagnostic user details\n` +
      `• \`/adminhelp\` — Show this help message\n\n` +
      `💡 _Note: You can pass \`<ID>\` as internal User ID (e.g. \`txN-YDx\`) or send the command in reply to a user's message._`

    await ctx.smartReply(text, { parse_mode: 'Markdown' })
  }
)
