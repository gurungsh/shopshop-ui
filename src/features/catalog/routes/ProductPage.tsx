import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { ApiError } from '@/api/errors'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { ProductImage } from '@/components/ui/ProductImage'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney } from '@/lib/money'
import { MAX_LINES, selectCanAdd, useCartStore } from '@/stores/cart-store'

import { categoriesQuery, productQuery } from '../api/queries'
import { RelatedProducts } from '../components/RelatedProducts'
import styles from './ProductPage.module.css'

export function ProductPage() {
  const { id = '' } = useParams()
  // A new product resets local state such as the quantity
  return <ProductView key={id} id={id} />
}

function ProductView({ id }: { id: string }) {
  const product = useQuery(productQuery(id))
  const categories = useQuery(categoriesQuery())
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const add = useCartStore((state) => state.add)
  const canAdd = useCartStore(selectCanAdd(id))

  const isNotFound =
    (product.error instanceof ApiError && product.error.status === 404) ||
    product.data?.isActive === false

  if (isNotFound) return <ProductNotFound />

  if (product.isError) {
    return (
      <Banner
        title="We couldn’t load this product."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void product.refetch()}
          >
            Try again
          </Button>
        }
      >
        Check your connection, then try again.
      </Banner>
    )
  }

  if (!product.data) return <ProductSkeleton />

  const item = product.data
  const categoryName = categories.data?.find(
    (category) => category.id === item.categoryId,
  )?.name

  return (
    <>
      <title>{`${item.name} · ShopShop`}</title>

      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to="/">All products</Link>
        {categoryName && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/?category=${item.categoryId}`}>{categoryName}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page" className={styles.current}>
          {item.name}
        </span>
      </nav>

      <div className={styles.layout}>
        <ProductImage
          categoryId={item.categoryId}
          iconSize={72}
          className={styles.image}
        />

        <div className={styles.details}>
          <div className={styles.titleBlock}>
            {categoryName && (
              <span className={styles.category}>{categoryName}</span>
            )}
            <h1 className={styles.name}>{item.name}</h1>
            <span className={styles.sku}>SKU {item.sku}</span>
          </div>

          <p className={styles.price}>{formatMoney(item.price)}</p>
          <p className={styles.description}>{item.description}</p>

          <div className={styles.buy}>
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button
              size="lg"
              disabled={!canAdd}
              onClick={() => {
                setAdded(add(item.id, quantity))
              }}
              className={styles.add}
            >
              Add to cart
            </Button>
          </div>

          <p role="status" className={styles.added}>
            {added && (
              <>
                Added to your cart. <Link to="/cart">View cart</Link>
              </>
            )}
          </p>
          {!canAdd && (
            <p className={styles.note}>
              Your cart already has {MAX_LINES} different products, the most one
              order can hold. Remove one to add this.
            </p>
          )}

          <p className={styles.note}>
            The price is confirmed by the store when you place your order.
          </p>
        </div>
      </div>

      <RelatedProducts product={item} categoryName={categoryName} />
    </>
  )
}

function ProductNotFound() {
  return (
    <div className={styles.notFound}>
      <title>Product not found · ShopShop</title>
      <h1 className={styles.name}>We can’t find that product</h1>
      <p className={styles.description}>
        It may have been removed, or the link may be wrong.
      </p>
      <Link to="/" className={buttonClass({ size: 'lg' })}>
        Back to the shop
      </Link>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className={styles.layout} aria-hidden="true">
      <Skeleton className={styles.image} />
      <div className={styles.details}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonLine} />
        <Skeleton className={styles.skeletonText} />
      </div>
    </div>
  )
}
