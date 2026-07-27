import type { UserWithBank } from '../repositories/user.repository.js'
import type { MyContext } from '../types/context.js'

export type TargetPlayerResult = {
  player: UserWithBank
  targetTgUser: NonNullable<MyContext['from']>
  isSelf: boolean
}

export type ExtractedTargetResult = {
  player: UserWithBank
  remainingText: string
}

export async function getTargetPlayer(
  ctx: MyContext
): Promise<TargetPlayerResult | null> {
  if (!ctx.from || !ctx.user) return null

  const replyUser = ctx.message?.reply_to_message?.from

  if (replyUser && !replyUser.is_bot && replyUser.id !== ctx.from.id) {
    const targetPlayer = await ctx.services.user.getOrCreateUser(
      BigInt(replyUser.id)
    )

    return {
      player: targetPlayer,
      targetTgUser: replyUser,
      isSelf: false,
    }
  }

  return {
    player: ctx.user,
    targetTgUser: ctx.from,
    isSelf: true,
  }
}

export async function extractTargetPlayer(
  ctx: MyContext,
  rawInput?: string
): Promise<{ target: ExtractedTargetResult } | { error: string }> {
  const replyUser = ctx.message?.reply_to_message?.from

  // 1. Извлечение по ответу на сообщение (Reply)
  if (replyUser) {
    if (replyUser.is_bot) {
      return { error: 'Команды нельзя выполнять на ботах!' }
    }
    const player = await ctx.services.user.getOrCreateUser(BigInt(replyUser.id))
    return {
      target: {
        player,
        remainingText: rawInput ? rawInput.trim() : '',
      },
    }
  }

  // 2. Извлечение по внутреннему ID пользователя в БД (User.id, например txN-YDx)
  if (!rawInput || !rawInput.trim()) {
    return {
      error: 'Укажите ID пользователя (`txN-YDx`) или отправьте команду в ответ на сообщение.',
    }
  }

  const tokens = rawInput.trim().split(/\s+/)
  const targetId = tokens[0]

  if (!targetId) {
    return { error: 'ID пользователя не указан!' }
  }

  const remainingText = tokens.slice(1).join(' ')
  const player = await ctx.services.user.getUserById(targetId)

  if (!player) {
    return { error: `Пользователь с ID \`${targetId}\` не найден!` }
  }

  return {
    target: {
      player,
      remainingText,
    },
  }
}