import { Role } from '../generated/prisma/client.js';

export const RoleLabels: Record<Role, string> = {
  [Role.BOMZH]: '💩 Бомж',
  [Role.PLANKTON]: '💼 Планктон',
  [Role.BUSINESS_PLUS]: '👑 Бизнес+',
  [Role.MODERATOR]: '🛡️ Модератор',
  [Role.ADMIN]: '👨‍💻 Админ',
};

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