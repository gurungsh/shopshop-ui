import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Banner } from './Banner'

describe('Banner', () => {
  it('is announced as an alert with its title and message', () => {
    render(
      <Banner title="We couldn’t load the products.">
        Check your connection.
      </Banner>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('We couldn’t load the products.')
    expect(alert).toHaveTextContent('Check your connection.')
  })

  it('shows its action', () => {
    render(
      <Banner
        title="Failed"
        action={<button type="button">Try again</button>}
      />,
    )

    expect(
      within(screen.getByRole('alert')).getByRole('button', {
        name: 'Try again',
      }),
    ).toBeInTheDocument()
  })

  it('leaves out the message when there is none', () => {
    render(<Banner title="Failed" />)

    expect(screen.getByRole('alert').querySelectorAll('p')).toHaveLength(1)
  })
})
