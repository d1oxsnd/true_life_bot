import { BankRepository } from '../repositories/bank.repository.js'

export class BankService {
	constructor(
		private bankRepo: BankRepository,
	) {}

	async transferMoney(fromUserId: string, toUserId: string, amount: bigint) {
		const success = await this.bankRepo.decrementBalance(fromUserId, amount)
		if (!success) {
			return { success: false, reason: 'INSUFFICIENT_FUNDS' } as const
		}

		await this.bankRepo.incrementBalance(toUserId, amount)

		return { success: true } as const
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
}
