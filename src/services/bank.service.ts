import type { Role } from '../generated/prisma/enums.js'
import { BankRepository } from '../repositories/bank.repository.js'

export class BankService {
	constructor(
		private bankRepo: BankRepository,
	) {}

	async transferMoney(fromUserId: string, toUserId: string, amount: bigint) {
		return await this.bankRepo.transferMoney(fromUserId, toUserId, amount)
	}

	async payMoney(userId: string, amount: bigint) {
		const success = await this.bankRepo.decrementBalance(userId, amount)
		if (!success) {
			return { success: false, reason: 'INSUFFICIENT_FUNDS' } as const
		}
		return { success: true } as const
	}

	async getMoney(userId: string, amount: bigint) {
		await this.bankRepo.incrementBalance(userId, amount)
		return { success: true } as const
	}

	async giveMoneyAdmin(userId: string, amount: bigint) {
		await this.bankRepo.incrementBalance(userId, amount)
		return { success: true } as const
	}

	async takeMoneyAdmin(userId: string, amount: bigint | 'all') {
		if (amount === 'all') {
			await this.bankRepo.setBalance(userId, 0n)
		} else {
			await this.bankRepo.forceDecrementBalance(userId, amount)
		}
		return { success: true } as const
	}

async payForRoleUpgrade(userId: string, amount: bigint, newRole: Role) {
  return await this.bankRepo.payForRoleUpgrade(userId, amount, newRole)
}
}
