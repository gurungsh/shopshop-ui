import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './ConfirmDialog'

function renderDialog(isPending = false) {
  const onOpenChange = vi.fn()
  const onConfirm = vi.fn()
  render(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete this?"
      description="You can’t undo this."
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      isPending={isPending}
    />,
  )
  return { onOpenChange, onConfirm, user: userEvent.setup() }
}

describe('ConfirmDialog', () => {
  it('confirms without closing itself, so the caller decides when', async () => {
    const { onOpenChange, onConfirm, user } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes on cancel or Escape', async () => {
    const { onOpenChange, user } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledTimes(2)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('stays open and disabled while the action runs', async () => {
    const { onOpenChange, user } = renderDialog(true)

    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled()
    await user.keyboard('{Escape}')

    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
