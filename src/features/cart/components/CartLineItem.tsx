import { Link } from 'react-router'

import { ProductImage } from '@/components/ui/ProductImage'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatMoney } from '@/lib/money'
import { MAX_QUANTITY, useCartStore } from '@/stores/cart-store'

import type { PricedLine } from '../lib/price-cart'
import styles from './CartLineItem.module.css'

export function CartLineItem({ line }: { line: PricedLine }) {
  const { product, quantity, total } = line
  const setQuantity = useCartStore((state) => state.setQuantity)
  const remove = useCartStore((state) => state.remove)

  return (
    <li className={styles.line}>
      <ProductImage
        categoryId={product.categoryId}
        iconSize={24}
        className={styles.image}
      />

      <div className={styles.details}>
        <Link to={`/products/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <span className={styles.unit}>{formatMoney(product.price)} each</span>
        <button
          type="button"
          aria-label={`Remove ${product.name}`}
          onClick={() => {
            remove(product.id)
          }}
          className={styles.remove}
        >
          Remove
        </button>
      </div>

      <QuantityStepper
        value={quantity}
        max={MAX_QUANTITY}
        hideLabel
        onChange={(value) => {
          setQuantity(product.id, value)
        }}
      />

      <span className={styles.total}>{formatMoney(total)}</span>
    </li>
  )
}
