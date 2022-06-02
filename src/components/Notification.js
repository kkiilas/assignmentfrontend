import React from 'react'
import { useSelector } from 'react-redux'

const Notification = () => {
  const notification = useSelector((state) => state.notification)

  if (!notification) {
    return null
  }

  return (
    <h5 className="text-center bg-dark bg-gradient border border-info border-3 rounded-3 p-3 lh-lg">
      {notification}
    </h5>
  )
}

export default Notification
