import type { Product } from '@/api/types/catalog'
import type { CartLine } from '@/stores/cart-store'

export interface PricedLine {
  product: Product
  quantity: number
  total: number
}

export interface UnavailableLine {
  productId: string
  name: string | undefined
}

export interface PricedCart {
  lines: PricedLine[]
  unavailable: UnavailableLine[]
  itemCount: number
  subtotal: number
}

const toCents = (amount: number) => Math.round(amount * 100)

export function priceCart(lines: CartLine[], products: Product[]): PricedCart {
  const byId = new Map(products.map((product) => [product.id, product]))
  const priced: PricedLine[] = []
  const unavailable: UnavailableLine[] = []
  let subtotalCents = 0

  for (const { productId, quantity } of lines) {
    const product = byId.get(productId)
    if (!product?.isActive) {
      unavailable.push({ productId, name: product?.name })
      continue
    }
    const totalCents = toCents(product.price) * quantity
    subtotalCents += totalCents
    priced.push({ product, quantity, total: totalCents / 100 })
  }

  return {
    lines: priced,
    unavailable,
    itemCount: priced.reduce((count, line) => count + line.quantity, 0),
    subtotal: subtotalCents / 100,
  }
}

const list = new Intl.ListFormat('en-US', { type: 'conjunction' })

export function unavailableMessage(lines: UnavailableLine[]): string {
  const names = lines.flatMap((line) => (line.name ? [line.name] : []))
  const unnamed = lines.length - names.length

  if (unnamed > 0) {
    const other = names.length > 0 ? 'other ' : ''
    names.push(
      unnamed === 1
        ? `${names.length > 0 ? 'one' : 'One'} ${other}item`
        : `${String(unnamed)} ${other}items`,
    )
  }

  const [verb, pronoun] = lines.length === 1 ? ['is', 'it'] : ['are', 'them']
  return `${list.format(names)} ${verb} no longer available, so we removed ${pronoun} from your cart.`
}
