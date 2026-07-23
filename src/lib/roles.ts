import { Role } from '../generated/prisma/client.js'

export const RoleLabels: Record<Role, string> = {
  [Role.BOMZH]: '💩 Бомж',
  [Role.PLANKTON]: '💼 Планктон',
  [Role.BUSINESS_PLUS]: '👑 Бизнес+',
  [Role.MODERATOR]: '🛡️ Мод',
  [Role.ADMIN]: '👨‍💻 Админ',
}

export const ROLE_WEIGHTS: Record<Role, number> = {
  [Role.BOMZH]: 0,
  [Role.PLANKTON]: 1,
  [Role.BUSINESS_PLUS]: 2,
  [Role.MODERATOR]: 50,
  [Role.ADMIN]: 100,
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_WEIGHTS[userRole] >= ROLE_WEIGHTS[requiredRole]
}

export interface RoleInfo {
  role: Role
  label: string
  price: bigint
  nextRole: Role | null
  description: string
}

export const GAME_ROLES_CONFIG: Record<string, RoleInfo> = {
  [Role.BOMZH]: {
    role: Role.BOMZH,
    label: RoleLabels[Role.BOMZH],
    price: 0n,
    nextRole: Role.PLANKTON,
    description: 'бизнесы, ипотека',
  },
  [Role.PLANKTON]: {
    role: Role.PLANKTON,
    label: RoleLabels[Role.PLANKTON],
    price: 100_000n,
    nextRole: Role.BUSINESS_PLUS,
    description: 'бизнесы, ипотека',
  },
  [Role.BUSINESS_PLUS]: {
    role: Role.BUSINESS_PLUS,
    label: RoleLabels[Role.BUSINESS_PLUS],
    price: 500_000_000n,
    nextRole: null,
    description: 'бизнесы, ипотека',
  },
}