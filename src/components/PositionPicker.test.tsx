import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import PositionPicker from '~/components/PositionPicker'
import { ButtonPosition } from '~/types'

const labels: Record<string, string> = {
  [ButtonPosition.TopLeft]: 'Top left',
  [ButtonPosition.TopRight]: 'Top right',
  [ButtonPosition.BottomLeft]: 'Bottom left',
  [ButtonPosition.BottomRight]: 'Bottom right',
}

const allowed = [
  ButtonPosition.TopLeft,
  ButtonPosition.TopRight,
  ButtonPosition.BottomLeft,
  ButtonPosition.BottomRight,
]

describe('PositionPicker', () => {
  it('renders one button per allowed position', () => {
    render(
      <PositionPicker
        value={ButtonPosition.TopLeft}
        allowed={allowed}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('marks the active position as pressed', () => {
    render(
      <PositionPicker
        value={ButtonPosition.BottomRight}
        allowed={allowed}
        onChange={vi.fn()}
      />,
    )

    expect(
      screen.getByLabelText(labels[ButtonPosition.BottomRight]),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByLabelText(labels[ButtonPosition.TopLeft]),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with the clicked position', () => {
    const onChange = vi.fn()
    render(
      <PositionPicker
        value={ButtonPosition.TopLeft}
        allowed={allowed}
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByLabelText(labels[ButtonPosition.TopRight]))

    expect(onChange).toHaveBeenCalledWith(ButtonPosition.TopRight)
  })

  it('only renders buttons for the allowed positions', () => {
    render(
      <PositionPicker
        value={ButtonPosition.TopLeft}
        allowed={[ButtonPosition.TopLeft, ButtonPosition.BottomLeft]}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(
      screen.queryByLabelText(labels[ButtonPosition.TopRight]),
    ).not.toBeInTheDocument()
  })
})
