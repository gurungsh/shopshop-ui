import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { ApiError } from '@/api/errors'
import type { User } from '@/api/types/identity'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextField } from '@/components/ui/TextField'

import { profileQuery, useUpdateProfile } from '../api/profile'
import { type ProfileValues, profileSchema } from '../lib/schemas'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  return (
    <div className={styles.page}>
      <title>Profile · ShopShop</title>
      <h1 className={styles.title}>Profile</h1>
      <ProfileContent />
    </div>
  )
}

function ProfileContent() {
  const { data: user, isError, refetch } = useQuery(profileQuery)

  if (user) {
    return <ProfileForm user={user} />
  }

  if (isError) {
    return (
      <Banner
        title="We couldn't load your profile."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void refetch()
            }}
          >
            Try again
          </Button>
        }
      />
    )
  }

  return <Skeleton className={styles.skeleton} />
}

function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { email: user.email, password: '', confirmPassword: '' },
  })

  const submit = handleSubmit(({ email, password }) => {
    update.mutate(
      { email, password },
      {
        onSuccess: (saved) => {
          reset({ email: saved.email, password: '', confirmPassword: '' })
        },
      },
    )
  })

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        void submit(event)
      }}
    >
      {update.isSuccess && <Banner tone="info" title="Profile saved." />}
      {update.error && (
        <Banner
          title={
            update.error instanceof ApiError
              ? update.error.message
              : "We couldn't save your profile. Try again in a moment."
          }
        />
      )}
      <p className={styles.role}>
        Account type: <strong>{user.role}</strong>
      </p>

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        hint={
          'Enter your current password to keep it, or a new one to change it. ' +
          'At least 8 characters, with an uppercase letter, a lowercase letter, ' +
          'a number and a special character.'
        }
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
