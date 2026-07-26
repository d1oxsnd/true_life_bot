import { prisma } from '../lib/prisma.js'

export class WorkRepository {
  async getOrCreateStats(userId: string) {
    return await prisma.workStats.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })
  }

  async recordWork(params: {
    userId: string
    earned: bigint
    newStreak: number
    isCrit: boolean
  }) {
    const { userId, earned, newStreak, isCrit } = params

    return await prisma.workStats.update({
      where: { userId },
      data: {
        lastWorkAt: new Date(),
        streak: newStreak,
        totalEarned: { increment: earned },
        totalWorks: { increment: 1 },
        ...(isCrit && { critCount: { increment: 1 } }),
      },
    })
  }
}