import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { applyApiError } from '@/api/form-errors'
import type { Product } from '@/api/types/catalog'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/CheckboxField'
import { FormActions, FormCard } from '@/components/ui/FormCard'
import { SelectField } from '@/components/ui/SelectField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { changedFields } from '@/lib/form'

import { useCreateProduct, useUpdateProduct } from '../api/admin-mutations'
import { adminCategoryOptionsQuery } from '../api/admin-queries'
import { type ProductValues, productSchema } from '../lib/admin-schemas'

const FIELDS = ['categoryId', 'name', 'description', 'sku', 'price'] as const

/** Creates a product, or edits `product` when it is given */
export function AdminProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const categories = useQuery(adminCategoryOptionsQuery())
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: product?.categoryId ?? '',
      name: product?.name ?? '',
      description: product?.description ?? '',
      sku: product?.sku ?? '',
      price: product ? String(product.price) : '',
      isActive: product?.isActive ?? true,
    },
  })
  const isPending = create.isPending || update.isPending

  const submit = handleSubmit((values) => {
    setFormError(null)
    const options = {
      onSuccess: () => {
        void navigate('/admin/products')
      },
      onError: (error: unknown) => {
        setFormError(
          applyApiError(error, setError, { fields: FIELDS, conflict: 'sku' }),
        )
      },
    }

    if (!product) {
      create.mutate({ ...values, price: Number(values.price) }, options)
      return
    }

    const { price, ...changed } = changedFields(values, dirtyFields)
    update.mutate(
      {
        id: product.id,
        body:
          price === undefined ? changed : { ...changed, price: Number(price) },
      },
      options,
    )
  })

  return (
    <FormCard
      onSubmit={(event) => {
        void submit(event)
      }}
    >
      {formError && (
        <Banner title="We couldn’t save the product.">{formError}</Banner>
      )}

      <SelectField
        label="Category"
        error={errors.categoryId?.message}
        {...register('categoryId')}
      >
        <option value="">Choose a category</option>
        {categories.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.isActive ? category.name : `${category.name} (inactive)`}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="SKU"
        hint="Letters, numbers, hyphens and underscores. Saved in capitals."
        spellCheck={false}
        error={errors.sku?.message}
        {...register('sku')}
      />
      <TextField
        label="Price (USD)"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        error={errors.price?.message}
        {...register('price')}
      />
      <TextAreaField
        label="Description"
        error={errors.description?.message}
        {...register('description')}
      />
      {product && (
        <CheckboxField
          label="Active"
          hint="Inactive products disappear from the store and from carts."
          {...register('isActive')}
        />
      )}

      <FormActions>
        <Button type="submit" disabled={isPending || (!!product && !isDirty)}>
          {isPending ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </Button>
        <Link
          to="/admin/products"
          className={buttonClass({ variant: 'secondary' })}
        >
          Cancel
        </Link>
      </FormActions>
    </FormCard>
  )
}
