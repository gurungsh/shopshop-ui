import { Link } from 'react-router'

import type { Product } from '@/api/types/catalog'
import { Button } from '@/components/ui/Button'
import { formatMoney } from '@/lib/money'

import styles from './ProductCard.module.css'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  categoryName?: string
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <ProductImage categoryId={product.categoryId} className={styles.image} />

      <div className={styles.body}>
        {categoryName && (
          <span className={styles.category}>{categoryName}</span>
        )}
        <h2 className={styles.name}>
          {/* Stretched over the whole card, so the card is one click target */}
          <Link to={`/products/${product.id}`} className={styles.link}>
            {product.name}
          </Link>
        </h2>

        <div className={styles.footer}>
          <span className={styles.price}>{formatMoney(product.price)}</span>
          <Button
            size="sm"
            disabled
            aria-label={`Add ${product.name} to cart`}
            className={styles.add}
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  )
}
