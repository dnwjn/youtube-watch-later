import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ButtonPositionSettings from '~/components/ButtonPositionSettings'
import useStorage from '~/hooks/useStorage'
import { ButtonPosition } from '~/types'

vi.mock('~/hooks/useStorage', () => ({
  default: vi.fn(),
}))

const mockedUseStorage = vi.mocked(useStorage)

describe('ButtonPositionSettings', () => {
  it('renders a placeholder and no position picker while loading', () => {
    mockedUseStorage.mockReturnValue([
      ButtonPosition.TopLeft,
      vi.fn(),
      { isLoading: true },
    ])

    render(<ButtonPositionSettings />)

    expect(screen.getByText('Grid videos')).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('renders a position picker per location once loaded', () => {
    mockedUseStorage.mockReturnValue([
      ButtonPosition.TopLeft,
      vi.fn(),
      { isLoading: false },
    ])

    render(<ButtonPositionSettings />)

    expect(screen.getByText('Grid videos')).toBeInTheDocument()
    expect(screen.getByText('Player sidebar')).toBeInTheDocument()
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
