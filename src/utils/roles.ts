import { Role } from '../generated/prisma/client.js';

export const RoleLabels: Record<Role, string> = {
  [Role.BOMZH]: '💩 Бомж',
  [Role.PLANKTON]: '💼 Планктон',
  [Role.BUSINESS_PLUS]: '👑 Бизнес+',
  [Role.MODERATOR]: '🛡️ Модератор',
  [Role.ADMIN]: '👨‍💻 Администратор',
};