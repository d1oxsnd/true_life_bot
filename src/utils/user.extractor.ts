import type { UserWithBankAccount } from '../repositories/user.repository.js'
import type { MyContext } from '../types/context.js'

export type TargetPlayerResult = {
  player: UserWithBankAccount
  targetTgUser: NonNullable<MyContext['from']>
  isSelf: boolean
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