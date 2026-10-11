import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'

import { type AddressInput, countries } from '../lib/address'
import styles from './AddressFields.module.css'

interface AddressFieldsProps {
  register: UseFormRegister<AddressInput>
  errors: FieldErrors<AddressInput>
}

export function AddressFields({ register, errors }: AddressFieldsProps) {
  return (
    <div className={styles.fields}>
      <TextField
        label="Full name"
        autoComplete="shipping name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <TextField
        label="Street address"
        autoComplete="shipping address-line1"
        error={errors.line1?.message}
        {...register('line1')}
      />
      <TextField
        label="Apartment, suite, etc. (optional)"
        autoComplete="shipping address-line2"
        error={errors.line2?.message}
        {...register('line2')}
      />
      <div className={styles.row}>
        <TextField
          label="City"
          autoComplete="shipping address-level2"
          error={errors.city?.message}
          {...register('city')}
        />
        <TextField
          label="State / region"
          autoComplete="shipping address-level1"
          error={errors.region?.message}
          {...register('region')}
        />
        <TextField
          label="Postal code"
          autoComplete="shipping postal-code"
          error={errors.postalCode?.message}
          {...register('postalCode')}
        />
      </div>
      <SelectField
        label="Country"
        autoComplete="shipping country-name"
        error={errors.country?.message}
        {...register('country')}
      >
        {countries.map((country) => (
          <option key={country}>{country}</option>
        ))}
      </SelectField>
    </div>
  )
}
