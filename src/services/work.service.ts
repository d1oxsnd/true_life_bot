import { Role } from '../generated/prisma/enums.js'
import { JOBS_BY_ROLE } from '../lib/works.js'
import type {PlayableRole, Job} from "../lib/works.js"
import { WorkRepository } from '../repositories/work.repository.js'
import { BankService } from './bank.service.js'

export type WorkOutcome = {
  job: Job
  earned: bigint
  baseEarned: bigint
  streak: number
  streakBonusPercent: number
  event: 'CRIT' | 'BONUS' | 'NORMAL' | 'LOSS'
}

export class WorkService {
  constructor(
    private workRepo: WorkRepository,
    private bankService: BankService,
  ) {}

  async processWork(userId: string, role: Role) {
    const playableRole = (role === Role.ADMIN || role === Role.MODERATOR
      ? Role.BUSINESS_PLUS
      : role) as PlayableRole

    const roleConfig = JOBS_BY_ROLE[playableRole]
    if (!roleConfig) {
      throw new Error(`No jobs configured for role: ${role}`)
    }

    const stats = await this.workRepo.getOrCreateStats(userId)
    const now = new Date()

    if (stats.lastWorkAt) {
      const elapsedMs = now.getTime() - stats.lastWorkAt.getTime()
      if (elapsedMs < roleConfig.cooldownMs) {
        const remainingMs = roleConfig.cooldownMs - elapsedMs
        return { success: false, reason: 'COOLDOWN', remainingMs } as const
      }
    }

    const streakWindowMs = roleConfig.cooldownMs + 60 * 60 * 1000
    let currentStreak = stats.streak

    if (stats.lastWorkAt) {
      const elapsedMs = now.getTime() - stats.lastWorkAt.getTime()
      if (elapsedMs > streakWindowMs) {
        currentStreak = 1
      } else {
        currentStreak = Math.min(currentStreak + 1, 10)
      }
    } else {
      currentStreak = 1
    }

    const randomJob =
      roleConfig.jobs[Math.floor(Math.random() * roleConfig.jobs.length)]!

    const range = randomJob.baseMax - randomJob.baseMin
    const randomBase = BigInt(Math.floor(Math.random() * Number(range))) + randomJob.baseMin

    const roll = Math.random() * 100
    let event: WorkOutcome['event'] = 'NORMAL'
    let multiplier = 1.0

    if (roll < 5) {
      event = 'CRIT'
      multiplier = 3.0
    } else if (roll < 15) {
      event = 'BONUS'
      multiplier = 1.5
    } else if (randomJob.canBeNegative && roll > 85) {
      event = 'LOSS'
      multiplier = -0.5
    }

    const streakBonusPercent = (currentStreak - 1) * 5
    const streakMultiplier = 1 + streakBonusPercent / 100

    let finalEarned = BigInt(
      Math.floor(Number(randomBase) * multiplier * streakMultiplier),
    )

    if (finalEarned > 0n) {
      await this.bankService.getMoney(userId, finalEarned)
    } else if (finalEarned < 0n) {
      await this.bankService.payMoney(userId, -finalEarned)
    }

    await this.workRepo.recordWork({
      userId,
      earned: finalEarned > 0n ? finalEarned : 0n,
      newStreak: currentStreak,
      isCrit: event === 'CRIT',
    })

    const outcome: WorkOutcome = {
      job: randomJob,
      earned: finalEarned,
      baseEarned: randomBase,
      streak: currentStreak,
      streakBonusPercent,
      event,
    }

    return { success: true, outcome } as const
  }
}