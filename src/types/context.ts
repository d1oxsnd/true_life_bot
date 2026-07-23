import {Context} from "grammy";
import { UserService } from '../services/user.service.js';
import { BankService } from '../services/bank.service.js';
import type { UserWithBankAccount } from '../repositories/user.repository.js'

export type Services = {
  user: UserService;
  bank: BankService;
}

export type MyContext = Context & {
  services: Services
  smartReply: Context['reply']
  user?: UserWithBankAccount
}