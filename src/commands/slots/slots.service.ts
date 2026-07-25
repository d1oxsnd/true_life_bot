export type SlotSymbol = '🍋' | '🍒' | '🍇' | '7️⃣' | '💎'

export class SlotsService {
  private readonly REELS: SlotSymbol[] = [
    '🍋', '🍋', '🍋', '🍋',
    '🍒', '🍒', '🍒',
    '🍇', '🍇',
    '7️⃣', '7️⃣',
    '💎',
  ]

  spin(): [SlotSymbol, SlotSymbol, SlotSymbol] {
    const getRandomSymbol = () =>
      this.REELS[Math.floor(Math.random() * this.REELS.length)]!

    return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
  }

  calculateMultiplier(combination: [SlotSymbol, SlotSymbol, SlotSymbol]): number {
    const [a, b, c] = combination

    if (a === b && b === c) {
      switch (a) {
        case '💎': return 10
        case '7️⃣': return 7
        case '🍒': return 5
        case '🍇': return 4
        case '🍋': return 3
      }
    }

    if (a === b || b === c || a === c) {
      return 1.5
    }

    return 0
  }
}