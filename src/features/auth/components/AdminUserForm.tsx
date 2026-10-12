import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { applyApiError } from '@/api/form-errors'
import type { User } from '@/api/types/identity'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { FormActions, FormCard } from '@/components/ui/FormCard'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'

import { useCreateUser, useUpdateUser } from '../api/admin-users'
import { roles } from '../lib/admin-user-filters'
import {
  type AdminCreateUserValues,
  adminCreateUserSchema,
  adminUpdateUserSchema,
} from '../lib/schemas'
import { useSession } from '../lib/use-session'

const FIELDS = ['email', 'password', 'role'] as const

/** Creates a user, or edits `user` when it is given */
export function AdminUserForm({ user }: { user?: User }) {
  const navigate = useNavigate()
  const create = useCreateUser()
  const update = useUpdateUser()
  const isSelf = useSession()?.user.id === user?.id
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<AdminCreateUserValues>({
    resolver: zodResolver(user ? adminUpdateUserSchema : adminCreateUserSchema),
    defaultValues: {
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'Customer',
    },
  })
  const isPending = create.isPending || update.isPending

  const submit = handleSubmit(({ email, password, role }) => {
    setFormError(null)
    const options = {
      onSuccess: () => {
        void navigate('/admin/users')
      },
      onError: (error: unknown) => {
        setFormError(
          applyApiError(error, setError, { fields: FIELDS, conflict: 'email' }),
        )
      },
    }

    if (!user) {
      create.mutate({ email, password, role }, options)
      return
    }
    // The select is not registered for the admin's own account, so it keeps the role
    update.mutate(
      { id: user.id, body: { email, role: isSelf ? user.role : role } },
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
        <Banner title="We couldn’t save the user.">{formError}</Banner>
      )}

      <TextField
        label="Email"
        type="email"
        autoComplete="off"
        error={errors.email?.message}
        {...register('email')}
      />
      {!user && (
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a special character."
          error={errors.password?.message}
          {...register('password')}
        />
      )}
      {isSelf ? (
        <SelectField label="Role" value={user?.role} disabled>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </SelectField>
      ) : (
        <SelectField
          label="Role"
          error={errors.role?.message}
          {...register('role')}
        >
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </SelectField>
      )}
      {isSelf && (
        <p>You can’t change your own role. Ask another admin to do it.</p>
      )}

      <FormActions>
        <Button type="submit" disabled={isPending || (!!user && !isDirty)}>
          {isPending ? 'Saving…' : user ? 'Save changes' : 'Create user'}
        </Button>
        <Link
          to="/admin/users"
          className={buttonClass({ variant: 'secondary' })}
        >
          Cancel
        </Link>
      </FormActions>
    </FormCard>
  )
}
