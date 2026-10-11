import { clsx } from 'clsx'
import { Package } from 'lucide-react'

import { categoryTint } from '@/lib/category-tint'

import styles from './ProductImage.module.css'

interface ProductImageProps {
  categoryId: string
  iconSize?: number
  className?: string
}

export function ProductImage({
  categoryId,
  iconSize = 40,
  className,
}: ProductImageProps) {
  return (
    <div
      data-tint={categoryTint(categoryId)}
      className={clsx(styles.image, className)}
    >
      <Package size={iconSize} strokeWidth={1.5} aria-hidden="true" />
    </div>
  )
}
