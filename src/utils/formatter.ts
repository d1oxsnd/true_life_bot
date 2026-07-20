const MONEY_TIERS = [
  { value: 1e12, symbol: 'трлн' },
  { value: 1e9, symbol: 'млрд' },
  { value: 1e6, symbol: 'млн' },
  { value: 1e3, symbol: 'к' },
] as const

const MONEY_MULTIPLIERS: Record<string, number> = {
  'k': 1e3, 'к': 1e3, 'тыс': 1e3,
  'm': 1e6, 'м': 1e6, 'млн': 1e6,
  'b': 1e9, 'б': 1e9, 'млрд': 1e9,
  't': 1e12, 'т': 1e12, 'трлн': 1e12,
}

export function formatMoney(amount: number | bigint): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount

  if (numAmount === 0) return '$0'

  for (const tier of MONEY_TIERS) {
    if (numAmount >= tier.value) {
      const formatted = (numAmount / tier.value)
        .toFixed(2)
        .replace(/\.00$/, '')
        .replace(/(\.\d[1-9])0$/, '$1')
      return `$${formatted}${tier.symbol}`
    }
  }

  return `$${numAmount}`
}

export function parseMoney(input: string): number | null {
  if (!input) return null

  const cleanInput = input.trim().toLowerCase().replace(',', '.').replace(/\$/g, '')

  if (!isNaN(Number(cleanInput))) {
    const val = Number(cleanInput)
    return val >= 0 ? val : null
  }

  const match = cleanInput.match(/^(\d+(?:\.\d+)?)\s*([a-zа-я]+)$/i)

  if (!match || !match[1] || !match[2]) return null

  const numStr = match[1]
  const suffix = match[2]

  const num = parseFloat(numStr)
  const multiplier = MONEY_MULTIPLIERS[suffix]

  if (isNaN(num) || !multiplier) {
    return null
  }

  const result = Math.floor(num * multiplier)

  return result >= 0 ? result : null
}