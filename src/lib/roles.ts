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
  description: string
}

export const GAME_ROLES_CONFIG: Partial<Record<Role, RoleInfo>> = {
  [Role.PLANKTON]: {
    role: Role.PLANKTON,
    label: RoleLabels[Role.PLANKTON],
    price: 100000n,
    description: 'бизнесы, ипотека',
  },
  [Role.BUSINESS_PLUS]: {
    role: Role.BUSINESS_PLUS,
    label: RoleLabels[Role.BUSINESS_PLUS],
    price: 500000000n,
    description: 'бизнесы, ипотека',
  },
}


export const ROLE_UPGRADE_PATH: Partial<Record<Role, Role>> = {
  [Role.BOMZH]: Role.PLANKTON,
  [Role.PLANKTON]: Role.BUSINESS_PLUS,
}

export function getNextRole(currentRole: Role): Role | null {
  return ROLE_UPGRADE_PATH[currentRole] ?? null
}

export function canUpgrade(currentRole: Role): boolean {
  return getNextRole(currentRole) !== null
}