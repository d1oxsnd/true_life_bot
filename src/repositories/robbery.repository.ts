import { prisma } from '../lib/prisma.js'

export class RobberyRepository {
  async getStats(userId: string) {
    return prisma.robberyStats.findUnique({
      where: { userId },
    })
  }

  async executeRobbery(params: {
    robberId: string
    victimId: string
    stolenAmount: bigint
    isSuccess: boolean
  }) {
    const { robberId, victimId, stolenAmount, isSuccess } = params

    return await prisma.$transaction(async (tx) => {
      await tx.robberyStats.upsert({
        where: { userId: robberId },
        create: {
          userId: robberId,
          lastRobbedAt: new Date(),
          successCount: isSuccess ? 1 : 0,
          totalCount: 1,
          totalStolen: isSuccess ? stolenAmount : 0n,
        },
        update: {
          lastRobbedAt: new Date(),
          totalCount: { increment: 1 },
          ...(isSuccess && {
            successCount: { increment: 1 },
            totalStolen: { increment: stolenAmount },
          }),
        },
      })

      if (isSuccess && stolenAmount > 0n) {
        const victimBalance = await tx.bankAccount.updateMany({
          where: { userId: victimId, balance: { gte: stolenAmount } },
          data: { balance: { decrement: stolenAmount } },
        })

        if (victimBalance.count === 0) {
          throw new Error('INSUFFICIENT_VICTIM_FUNDS')
        }

        await tx.bankAccount.update({
          where: { userId: robberId },
          data: { balance: { increment: stolenAmount } },
        })
      }

      return true
    })
  }
}