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
      { id: 'ozon_receiving', title: 'Приёмка и разгрузка (Склад Ozon)', icon: '📦', baseMin: 5_000n, baseMax: 12_000n, canBeNegative: true },
      { id: 'ozon_placement', title: 'Размещение товара (Склад Ozon)', icon: '📥', baseMin: 6_000n, baseMax: 13_000n, canBeNegative: true },
      { id: 'ozon_picking', title: 'Сборка заказов на ТСД (Склад Ozon)', icon: '🛒', baseMin: 7_000n, baseMax: 15_000n, canBeNegative: true },
      { id: 'ozon_packing', title: 'Упаковка и консолидация (Склад Ozon)', icon: '📦', baseMin: 5_500n, baseMax: 12_500n, canBeNegative: true },
      { id: 'ozon_shipping', title: 'Отгрузка и сортировка (Склад Ozon)', icon: '🚚', baseMin: 6_500n, baseMax: 14_000n, canBeNegative: true },
    ],
  },
  PLANKTON: {
    cooldownMs: 15 * 60 * 1000, // 15 минут
    jobs: [
      { id: 'freelance_landing', title: 'Вёрстка лендинга (Фриланс)', icon: '💻', baseMin: 30_000n, baseMax: 80_000n, canBeNegative: true },
      { id: 'freelance_wordpress', title: 'Правки на WordPress (Фриланс)', icon: '🛠', baseMin: 25_000n, baseMax: 70_000n, canBeNegative: true },
      { id: 'freelance_target', title: 'Настройка таргета (Фриланс)', icon: '🎯', baseMin: 40_000n, baseMax: 100_000n, canBeNegative: true },
      { id: 'freelance_design', title: 'Дизайн карточек и баннеров', icon: '🎨', baseMin: 20_000n, baseMax: 60_000n, canBeNegative: true },
    ],
  },
  BUSINESS_PLUS: {
    cooldownMs: 30 * 60 * 1000, // 30 минут
    jobs: [
      { id: 'infobiz_marathon', title: 'Продажа «Марафона Желаний»', icon: '🔮', baseMin: 150_000n, baseMax: 450_000n, canBeNegative: true },
      { id: 'infobiz_mentoring', title: 'ВИП-менторство (Продажа воздуха)', icon: '📿', baseMin: 200_000n, baseMax: 500_000n, canBeNegative: true },
      { id: 'infobiz_chakra', title: 'Медитации на чакры изобилия', icon: '🕯', baseMin: 180_000n, baseMax: 480_000n, canBeNegative: true },
    ],
  },
}