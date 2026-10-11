import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { ApiError } from '@/api/errors'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import { useRegister } from '../api/mutations'
import { loginPath, safeReturnTo } from '../lib/login-path'
import { type RegisterValues, registerSchema } from '../lib/schemas'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const returnTo = safeReturnTo(searchParams.get('returnTo'))

  const navigate = useNavigate()
  const registration = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const submit = handleSubmit(({ email, password }) => {
    registration.mutate(
      { email, password },
      {
        onSuccess: () => {
          void navigate(returnTo, { replace: true })
        },
      },
    )
  })

  const emailTaken =
    registration.error instanceof ApiError && registration.error.status === 409

  return (
    <div className={styles.card}>
      <title>Create your account · ShopShop</title>

      <div className={styles.heading}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Keep your cart, check out faster and follow your orders.
        </p>
      </div>

      {emailTaken ? (
        <Banner title="An account with that email already exists.">
          <Link to={loginPath({ returnTo })}>Sign in instead</Link>
        </Banner>
      ) : (
        registration.error && (
          <Banner title="We couldn’t create your account. Try again in a moment." />
        )
      )}

      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          void submit(event)
        }}
      >
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
          hint="At least 8 characters, with an uppercase letter, a lowercase letter, a number and a special character."
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
        <Button
          type="submit"
          size="lg"
          className={styles.submit}
          disabled={registration.isPending}
        >
          {registration.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to={loginPath({ returnTo })}>Sign in</Link>
      </p>
    </div>
  )
}
