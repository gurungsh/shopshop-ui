import { beforeEach, describe, expect, it } from 'vitest'

import {
  addressSchema,
  emptyAddress,
  joinAddress,
  loadAddressDraft,
  saveAddressDraft,
} from './address'

const address = {
  fullName: ' Alex Morgan ',
  line1: '221 Harbour Street',
  line2: '',
  city: 'Portland',
  region: 'OR',
  postalCode: '97201',
  country: 'United States' as const,
}

describe('addressSchema', () => {
  it('trims the fields and joins them line by line', () => {
    const parsed = addressSchema.parse(address)

    expect(joinAddress(parsed)).toBe(
      'Alex Morgan\n221 Harbour Street\nPortland, OR 97201\nUnited States',
    )
  })

  it('keeps the optional second line when it is filled in', () => {
    const parsed = addressSchema.parse({ ...address, line2: 'Apt 4' })

    expect(joinAddress(parsed).split('\n')[2]).toBe('Apt 4')
  })

  it('says which required field is missing', () => {
    const result = addressSchema.safeParse({ ...address, postalCode: '  ' })

    expect(result.error?.issues).toMatchObject([
      { path: ['postalCode'], message: 'Enter a postal code.' },
    ])
  })

  it('rejects an address longer than the API allows', () => {
    const long = 'x'.repeat(120)
    const result = addressSchema.safeParse({
      ...address,
      fullName: long,
      line1: long,
      line2: long,
      city: long,
      region: long,
    })

    expect(result.error?.issues).toMatchObject([{ path: ['line1'] }])
  })
})

describe('address draft', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('round-trips through sessionStorage', () => {
    saveAddressDraft({ ...emptyAddress, fullName: 'Al', city: 'Portland' })

    expect(loadAddressDraft()).toEqual({
      ...emptyAddress,
      fullName: 'Al',
      city: 'Portland',
    })
  })

  it('falls back to an empty address when the draft is malformed', () => {
    sessionStorage.setItem('shopshop.checkout.address', '{"city": 42')

    expect(loadAddressDraft()).toEqual(emptyAddress)
  })
})
