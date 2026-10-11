import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import type { Product } from '@/api/types/catalog'
import { formatMoney } from '@/lib/money'

import { productListQuery } from '../api/queries'
import { ProductImage } from './ProductImage'
import styles from './RelatedProducts.module.css'

const SHOWN = 3

interface RelatedProductsProps {
  product: Product
  categoryName: string | undefined
}

export function RelatedProducts({
  product,
  categoryName,
}: RelatedProductsProps) {
  const related = useQuery({
    // One extra, in case the current product comes back in the results
    ...productListQuery({
      categoryIds: [product.categoryId],
      page: 1,
      pageSize: SHOWN + 1,
    }),
    placeholderData: undefined,
  })

  const items = related.data?.items
    .filter((item) => item.id !== product.id)
    .slice(0, SHOWN)

  if (!items?.length) return null

  return (
    <section aria-labelledby="related-heading" className={styles.section}>
      <h2 id="related-heading" className={styles.heading}>
        More in {categoryName ?? 'this category'}
      </h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/products/${item.id}`} className={styles.link}>
              <ProductImage
                categoryId={item.categoryId}
                iconSize={22}
                className={styles.image}
              />
              <span className={styles.text}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.price}>{formatMoney(item.price)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
