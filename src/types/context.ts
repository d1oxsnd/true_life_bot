import {Context} from "grammy";
import { UserService } from '../services/user.service.js';
import { BankService } from '../services/bank.service.js';
import type { UserWithBank } from '../repositories/user.repository.js'
import type { RobberyService } from '../services/robbery.service.js'

export type Services = {
  user: UserService;
  bank: BankService;
  robbery: RobberyService
}

export type MyContext = Context & {
  services: Services
  smartReply: Context['reply']
  user?: UserWithBank
}