import type { Context } from 'grammy'
import type { AdminService } from '../services/admin.service.js'

export class AdminHandler {
  constructor(private adminService: AdminService) {}

  async onChangeId(ctx: Context): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return

    try {
      const text = ctx.message.text.trim()
      const parts = text.split(/\s+/).slice(1)

      if (parts.length === 0) {
        await ctx.reply(
          `🛠️ Использование команды:\n\n` +
            `👉 Поменять ID себе:\n` +
            `       \`/changeid [новый айди]\`\n\n` +
            `👉 Поменять ID игроку:\n` +
            `       \`/changeid [айди игрока] [новый айди]\`\n`,
          { parse_mode: 'Markdown' },
        )
        return
      }

      let result

      if (parts.length === 1) {
        const newId = parts[0] || ''
        const telegramId = BigInt(ctx.from.id)
        result = await this.adminService.changePlayerId({ type: 'telegramId', id: telegramId }, newId)
      } else {
        const oldId = parts[0] || ''
        const newId = parts[1] || ''
        result = await this.adminService.changePlayerId({ type: 'customId', id: oldId }, newId)
      }

      if (result.success) {
        await ctx.reply(
          `👑 ID успешно изменен!\n` +
            `👤 Игрок:\n` +
            `       _${result.targetUsername}_\n` +
            `🆔 Старый ID:\n` +
            `       \`${result.oldId}\`\n` +
            `✨ Новый ID:\n` +
            `       \`${result.newId}\`\n`,
          { parse_mode: 'Markdown' },
        )
        return
      }

      switch (result.reason) {
        case 'USER_NOT_FOUND':
          await ctx.reply(`⚠️ Ошибка:\n       _Игрок с таким ID не найден_\n`, { parse_mode: 'Markdown' })
          break
        case 'INVALID_FORMAT':
          await ctx.reply(`⚠️ Ошибка формата:\n       _ID содержит запрещенные символы или некорректную длину_\n`, { parse_mode: 'Markdown' })
          break
        case 'ID_TAKEN':
          await ctx.reply(`⚠️ Ошибка:\n       _Этот ID уже занят другим игроком_\n`, { parse_mode: 'Markdown' })
          break
      }
    } catch (error) {
      console.error('Ошибка в onChangeId хендлере:', error)
      await ctx.reply(`⚠️ Ошибка:\n       _Не удалось изменить ID_\n`, { parse_mode: 'Markdown' })
    }
  }
}