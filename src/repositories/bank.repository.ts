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
}