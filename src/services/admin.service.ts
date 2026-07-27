import { Role } from '../generated/prisma/enums.js'
import type { UserRepository, UserWithBank } from '../repositories/user.repository.js'
import type { BankRepository } from '../repositories/bank.repository.js'

export class AdminService {
  constructor(
    private userRepo: UserRepository,
    private bankRepo: BankRepository
  ) {}

  async giveMoney(userId: string, amount: bigint): Promise<UserWithBank> {
    await this.bankRepo.incrementBalance(userId, amount)
    const updatedUser = await this.userRepo.findById(userId)
    if (!updatedUser) throw new Error('User not found')
    return updatedUser
  }

  async takeMoney(userId: string, amount: bigint | 'all'): Promise<UserWithBank> {
    if (amount === 'all') {
      await this.bankRepo.setBalance(userId, 0n)
    } else {
      await this.bankRepo.forceDecrementBalance(userId, amount)
    }
    const updatedUser = await this.userRepo.findById(userId)
    if (!updatedUser) throw new Error('User not found')
    return updatedUser
  }

  async setRole(userId: string, newRole: Role): Promise<UserWithBank> {
    return this.userRepo.updateById(userId, { role: newRole })
  }

  async banUser(userId: string): Promise<UserWithBank> {
    return this.userRepo.updateById(userId, { isBanned: true })
  }

  async unbanUser(userId: string): Promise<UserWithBank> {
    return this.userRepo.updateById(userId, { isBanned: false })
  }

  async getUserInfo(userId: string): Promise<UserWithBank | null> {
    return this.userRepo.findById(userId)
  }
}
