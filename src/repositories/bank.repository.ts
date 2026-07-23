import type { Role } from '../generated/prisma/enums.js'
import { prisma } from "../lib/prisma.js";

export class BankRepository {
  async decrementBalance(userId: string, amount: bigint): Promise<boolean> {
    const res = await prisma.bankAccount.updateMany({
      where: { userId, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    return res.count > 0;
  }

  async incrementBalance(userId: string, amount: bigint): Promise<void> {
    await prisma.bankAccount.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });
  }

async payForRoleUpgrade(
  userId: string,
  amount: bigint,
  newRole: Role
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const balanceUpdate = await tx.bankAccount.updateMany({
        where: { 
          userId, 
          balance: { gte: amount } 
        },
        data: { balance: { decrement: amount } },
      });

      if (balanceUpdate.count === 0) {
        throw new Error('NOT_ENOUGH_MONEY');
      }

      await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
    });

    return { success: true };

  } catch (error: any) {
    if (error.message === 'NOT_ENOUGH_MONEY') {
      return { success: false, error: 'NOT_ENOUGH_MONEY' };
    }
    
    console.error('Transaction failed:', error);
    return { success: false, error: 'TRANSACTION_ERROR' };
  }
}
}