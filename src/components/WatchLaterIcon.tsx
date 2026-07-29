import React from 'react'

import { ButtonStatus } from '~types'

const WatchLaterIcon = ({ status }: { status: number }) => {
  if (status === ButtonStatus.Success) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    )
  }

  if (status === ButtonStatus.Error) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="with-fill">
      <path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path>
    </svg>
  )
}

export default WatchLaterIcon
