import { RobberyRepository } from '../repositories/robbery.repository.js'

export class RobberyService {
  constructor(private robberyRepo: RobberyRepository) {}

  calculateSuccessChance(successCount: number): number {
    const baseChance = 10
    const bonusPerWin = 0.5
    const maxChance = 25

    const totalChance = baseChance + successCount * bonusPerWin
    return Math.min(totalChance, maxChance)
  }

  checkCooldown(lastRobbedAt: Date | null): { canRob: boolean; remainingMs: number } {
    if (!lastRobbedAt) return { canRob: true, remainingMs: 0 }

    const COOLDOWN_MS = 1 * 60 * 60 * 1000
    const now = Date.now()
    const diff = now - new Date(lastRobbedAt).getTime()

    if (diff >= COOLDOWN_MS) {
      return { canRob: true, remainingMs: 0 }
    }

    return { canRob: false, remainingMs: COOLDOWN_MS - diff }
  }

  async attemptRobbery(robberId: string, victimId: string, victimBalance: bigint) {
    const stats = await this.robberyRepo.getStats(robberId)

    const cooldown = this.checkCooldown(stats?.lastRobbedAt ?? null)
    if (!cooldown.canRob) {
      return {
        success: false,
        reason: 'COOLDOWN' as const,
        remainingMs: cooldown.remainingMs,
      }
    }

    const currentSuccesses = stats?.successCount ?? 0
    const currentTotalStolen = stats?.totalStolen ?? 0n
    const chance = this.calculateSuccessChance(currentSuccesses)
    const roll = Math.random() * 100
    const isSuccess = roll <= chance

    let stolenAmount = 0n
    if (isSuccess && victimBalance > 0n) {
      const minPercent = 5
      const maxPercent = 15
      const randomPercent = Math.floor(Math.random() * (maxPercent - minPercent + 1)) + minPercent
      stolenAmount = (victimBalance * BigInt(randomPercent)) / 100n
    }

    if (isSuccess && stolenAmount === 0n) {
      await this.robberyRepo.executeRobbery({
        robberId,
        victimId,
        stolenAmount: 0n,
        isSuccess: false,
      })
      return { success: false, reason: 'VICTIM_IS_POOR' as const, chance }
    }

    try {
      await this.robberyRepo.executeRobbery({
        robberId,
        victimId,
        stolenAmount,
        isSuccess,
      })
    } catch (err) {
      if ((err as Error).message === 'INSUFFICIENT_VICTIM_FUNDS') {
        return { success: false, reason: 'VICTIM_IS_POOR' as const, chance }
      }
      throw err
    }

    return {
      success: isSuccess,
      reason: isSuccess ? ('SUCCESS' as const) : ('FAILED' as const),
      stolenAmount,
      chance,
      newExperience: isSuccess ? currentSuccesses + 1 : currentSuccesses,
      totalStolen: isSuccess ? currentTotalStolen + stolenAmount : currentTotalStolen,
    }
  }
}