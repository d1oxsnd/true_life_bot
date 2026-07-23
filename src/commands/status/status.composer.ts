import { Composer } from 'grammy'
import { Role } from '../../generated/prisma/client.js'
import { GAME_ROLES_CONFIG, RoleLabels, ROLE_WEIGHTS } from '../../lib/roles.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import type { MyContext } from '../../types/context.js'
import { formatMoney } from '../../utils/money.formatter.js'

export const statusComposer = new Composer<MyContext>()

statusComposer.hears(/^статус$/i, authMiddleware, async ctx => {
	if (!ctx.user) return

	const currentRole = ctx.user.role as Role
	const currentWeight = ROLE_WEIGHTS[currentRole] ?? 0

	let text = `Доступные игровые статусы\n\n`

	Object.values(GAME_ROLES_CONFIG).forEach(info => {
		if (info.role === Role.BOMZH) return

		const isCurrent = info.role === currentRole
		const infoWeight = ROLE_WEIGHTS[info.role] ?? 0
		const isUnlocked = infoWeight <= currentWeight

		const priceText = info.price > 0n ? formatMoney(info.price) : 'Бесплатно'

		const labelText = isCurrent ? `*${info.label} 👈 — сейчас*` : info.label

		const formattedDescription = info.description
			.split(',')
			.map(item => {
				const trimmed = item.trim()
				return isUnlocked ? `\`${trimmed}\`` : `_${trimmed}_`
			})
			.join('\n              ')

		text += `${labelText}\n`
		text += `      💵 **Цена:** _${priceText}_\n`
		text += `      ⚙️ **Команды:** \n              ${formattedDescription}\n`
	})

	text += `\n💡 Чтобы повысить статус\n` + `      \`💬 статус поднять\``

	await ctx.smartReply(text, { parse_mode: 'Markdown' })
})

statusComposer.hears(/^статус поднять$/i, authMiddleware, async ctx => {
	if (!ctx.user || !ctx.from) return

	const currentRole = ctx.user.role as Role
	const currentConfig = GAME_ROLES_CONFIG[currentRole]

	if (!currentConfig || !currentConfig.nextRole) {
		await ctx.smartReply(`✋ Максимальный игровой статус!\n` + 
			`      Ждите новые обновления :D`)
		return
	}

	const nextConfig = GAME_ROLES_CONFIG[currentConfig.nextRole]
	if (!nextConfig) {
		await ctx.smartReply('⚠️ Следующий статус не найден.')
		return
	}

	const upgradePrice = nextConfig.price

	try {
		const paymentResult = await ctx.services.bank.payMoney(ctx.user.id, upgradePrice)

		if (!paymentResult.success) {
			const currentBalance = ctx.user.bankAccount?.balance || 0n
			const missing = upgradePrice > currentBalance ? upgradePrice - currentBalance : 0n

			await ctx.smartReply(
				`🤏🏻 Недостаточно средств!\n` +
					`      Для статуса _${nextConfig.label}_\n` +
					`            не хватает 💵 _${formatMoney(missing)}_`,
				{ parse_mode: 'Markdown' },
			)
			return
		}

		await ctx.services.user.updateUser(BigInt(ctx.from.id), {
			role: nextConfig.role,
		})

		await ctx.smartReply(
			`🎉 Успешно повышено\n` +
				`      до статуса _${nextConfig.label}_\n` +
				`            и списано 💵 _${formatMoney(upgradePrice)}_`,
			{ parse_mode: 'Markdown' },
		)
	} catch (error) {
		console.error('Ошибка при повышении статуса:', error)
		await ctx.smartReply('⚠️ Произошла ошибка при покупке статуса. Попробуйте позже.')
	}
})
