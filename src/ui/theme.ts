import { formatMoney } from '../utils/money.formatter.js'

export const UI = {
	header: (username: string, userId: number | string, action: string, icon = '⚙️') => {
		return `${icon} [${username}](tg://user?id=${userId}),\n${action}:`
	},

	actionCard: (params: {
		username: string
		userId: number | string
		action: string
		icon?: string
		statusTitle?: string
		content?: string
		money?: { amount: bigint; sign?: '+' | '-' | '' }
	}) => {
		const { username, userId, action, icon = '⚙️', statusTitle, content,  money } = params

		const lines: string[] = []

		lines.push(`${icon} [${username}](tg://user?id=${userId}),\n${action}:`)

		if (statusTitle) {
			lines.push(`${statusTitle}:`)
		}

		if (content) {
			lines.push(`${content}`)
		}

		if (money) {
			const sign = money.sign ?? ''
			lines.push(`💵 _${sign}${formatMoney(money.amount)}_`)
		}

		return lines.join('\n')
	},

	error: (title: string, details?: string) => {
		return `❌ ${title}` + (details ? `\n${details}` : '')
	},

	guide: (icon: string, title: string, command: string, description?: string) => {
		const descText = description ? ` (${description})` : ''
		return `${icon} ${title}:\n\`${command}\` ${descText}`
	},

	insufficientFunds: (balance: bigint) => {
    return UI.error(
      'У вас недостаточно средств!',
      `Ваш баланс: 💵 _${formatMoney(balance)}_`
    )
  },
}
