import { Context } from 'grammy'
import { UserService } from '../services/user.service.js'
import { BankService } from '../services/bank.service.js'
import type { UserWithBank } from '../repositories/user.repository.js'
import type { RobberyService } from '../services/robbery.service.js'
import type { SlotsService } from '../commands/slots/slots.service.js'
import type { WorkService } from '../services/work.service.js'
import type { AdminService } from '../services/admin.service.js'

export type Services = {
  user: UserService
  bank: BankService
  robbery: RobberyService
  slots: SlotsService
  work: WorkService
  admin: AdminService
}

export type MyContext = Context & {
  services: Services
  smartReply: Context['reply']
  user?: UserWithBank
}