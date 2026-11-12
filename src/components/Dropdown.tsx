import React, { useEffect, useId, useRef, useState } from 'react'

import '~/css/shared.css'

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  options: Option[]
  onChange: (value: string) => void
  labelledBy?: string
}

const Dropdown = ({ value, options, onChange, labelledBy }: Props) => {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const triggerId = useId()

  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )

  const openList = () => {
    setFocused(selectedIndex)
    setOpen(true)
  }

  const choose = (index: number) => {
    onChange(options[index].value)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', close)

    return () => document.removeEventListener('mousedown', close)
  }, [open])

  // Keep the whole list on screen when it opens near the bottom of the popup.
  useEffect(() => {
    if (open) list.current?.scrollIntoView?.({ block: 'nearest' })
  }, [open])

  useEffect(() => {
    if (open) {
      list.current?.children[focused]?.scrollIntoView?.({ block: 'nearest' })
    }
  }, [open, focused])

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        openList()
      }

      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocused((index) => Math.min(index + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocused((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setFocused(0)
        break
      case 'End':
        event.preventDefault()
        setFocused(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(focused)
        break
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className="dropdown" ref={root} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={triggerId}
        className="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy ? `${labelledBy} ${triggerId}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}>
        <span className="status">{options[selectedIndex]?.label}</span>
      </button>

      {open && (
        <ul
          className="dropdown-list"
          role="listbox"
          aria-labelledby={labelledBy}
          ref={list}>
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={index === selectedIndex}
              className={[
                'dropdown-option',
                index === focused && 'focused',
                index === selectedIndex && 'selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setFocused(index)}
              onClick={() => choose(index)}>
              {option.label}
              {index === selectedIndex && <span aria-hidden="true">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
