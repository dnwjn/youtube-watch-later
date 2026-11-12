import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import Dropdown from '~/components/Dropdown'

const options = [
  { value: 'auto', label: 'Browser default' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'de', label: 'Deutsch' },
]

const setup = (value = 'auto') => {
  const onChange = vi.fn()
  render(<Dropdown value={value} options={options} onChange={onChange} />)

  return { onChange, trigger: screen.getByRole('button') }
}

describe('Dropdown', () => {
  it('shows the selected label and keeps the list closed', () => {
    setup('nl')

    expect(screen.getByRole('button')).toHaveTextContent('Nederlands')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects an option on click and closes', () => {
    const { onChange, trigger } = setup()

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('option', { name: 'Deutsch' }))

    expect(onChange).toHaveBeenCalledWith('de')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports arrow keys, Enter and Escape', () => {
    const { onChange, trigger } = setup()

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('nl')

    fireEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when clicking outside', () => {
    const { trigger } = setup()

    fireEvent.click(trigger)
    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
