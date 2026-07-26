import { Role } from '../generated/prisma/enums.js'

export type Job = {
  id: string
  title: string
  icon: string
  baseMin: bigint
  baseMax: bigint
  canBeNegative?: boolean
}

export type PlayableRole = Exclude<Role, 'MODERATOR' | 'ADMIN'>

export const JOBS_BY_ROLE: Record<PlayableRole, { cooldownMs: number; jobs: Job[] }> = {
  BOMZH: {
    cooldownMs: 5 * 60 * 1000, // 5 минут
    jobs: [
      { id: 'leaflets', title: 'Раздача листовок', icon: '📄', baseMin: 50n, baseMax: 150n },
      { id: 'bottles', title: 'Сбор бутылок', icon: '🍾', baseMin: 30n, baseMax: 100n },
      { id: 'headlights', title: 'Мытьё фар на светофоре', icon: '🚗', baseMin: 80n, baseMax: 200n },
    ],
  },
  PLANKTON: {
    cooldownMs: 15 * 60 * 1000,
    jobs: [
      { id: 'clerk', title: 'Офисный клерк', icon: '🖥', baseMin: 1_000n, baseMax: 3_000n },
      { id: 'courier', title: 'Курьер на электровелосипеде', icon: '🚲', baseMin: 800n, baseMax: 2_500n },
      { id: 'smm', title: 'SMM-щик в Telegram', icon: '📱', baseMin: 1_200n, baseMax: 3_500n },
    ],
  },
  BUSINESS_PLUS: {
    cooldownMs: 30 * 60 * 1000,
    jobs: [
      { id: 'crypto', title: 'Крипто-трейдинг', icon: '📈', baseMin: 10_000n, baseMax: 50_000n, canBeNegative: true },
      { id: 'startup', title: 'Инвестиции в стартап', icon: '🚀', baseMin: 20_000n, baseMax: 80_000n, canBeNegative: true },
    ],
  },
}