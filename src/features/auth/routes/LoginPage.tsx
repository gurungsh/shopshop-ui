import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { ApiError } from '@/api/errors'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import { useLogin } from '../api/mutations'
import { registerPath, safeReturnTo } from '../lib/login-path'
import { type LoginValues, loginSchema } from '../lib/schemas'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const returnTo = safeReturnTo(searchParams.get('returnTo'))
  const expired = searchParams.get('reason') === 'expired'

  const navigate = useNavigate()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        void navigate(returnTo, { replace: true })
      },
    })
  })

  return (
    <div className={styles.card}>
      <title>Sign in · ShopShop</title>

      <div className={styles.heading}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>
          {returnTo.startsWith('/checkout')
            ? 'Sign in to finish checking out. Your cart is saved.'
            : 'Welcome back.'}
        </p>
      </div>

      {login.error ? (
        <Banner title={signInError(login.error)} />
      ) : (
        expired && (
          <Banner
            tone="info"
            title="Your session ended. Sign in again and we’ll take you back to where you were."
          />
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button
          type="submit"
          size="lg"
          className={styles.submit}
          disabled={login.isPending}
        >
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className={styles.footer}>
        New to ShopShop?{' '}
        <Link to={registerPath(returnTo)}>Create an account</Link>
      </p>
    </div>
  )
}

function signInError(error: Error) {
  return error instanceof ApiError && error.status === 401
    ? 'That email and password don’t match. Try again.'
    : 'We couldn’t sign you in. Try again in a moment.'
}
