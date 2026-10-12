import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { applyApiError } from '@/api/form-errors'
import type { Category } from '@/api/types/catalog'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/CheckboxField'
import { FormActions, FormCard } from '@/components/ui/FormCard'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { changedFields } from '@/lib/form'

import { useCreateCategory, useUpdateCategory } from '../api/admin-mutations'
import { type CategoryValues, categorySchema } from '../lib/admin-schemas'

const FIELDS = ['name', 'description'] as const

/** Creates a category, or edits `category` when it is given */
export function AdminCategoryForm({ category }: { category?: Category }) {
  const navigate = useNavigate()
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      isActive: category?.isActive ?? true,
    },
  })
  const isPending = create.isPending || update.isPending

  const submit = handleSubmit((values) => {
    setFormError(null)
    const options = {
      onSuccess: () => {
        void navigate('/admin/categories')
      },
      onError: (error: unknown) => {
        setFormError(
          applyApiError(error, setError, { fields: FIELDS, conflict: 'name' }),
        )
      },
    }

    if (!category) {
      create.mutate(
        { name: values.name, description: values.description },
        options,
      )
      return
    }
    update.mutate(
      { id: category.id, body: changedFields(values, dirtyFields) },
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
        <Banner title="We couldn’t save the category.">{formError}</Banner>
      )}

      <TextField
        label="Name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextAreaField
        label="Description"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />
      {category && (
        <CheckboxField
          label="Active"
          hint="Inactive categories are no longer offered as a filter in the store."
          {...register('isActive')}
        />
      )}

      <FormActions>
        <Button type="submit" disabled={isPending || (!!category && !isDirty)}>
          {isPending
            ? 'Saving…'
            : category
              ? 'Save changes'
              : 'Create category'}
        </Button>
        <Link
          to="/admin/categories"
          className={buttonClass({ variant: 'secondary' })}
        >
          Cancel
        </Link>
      </FormActions>
    </FormCard>
  )
}
