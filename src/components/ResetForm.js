import React from 'react'
import { useDispatch } from 'react-redux'
import { clearPackages } from '../reducers/packageReducer'
import { setNotification } from '../reducers/notificationReducer'

const ResetForm = () => {
  const dispatch = useDispatch()

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(clearPackages())
    window.localStorage.clear()
    dispatch(setNotification('Packages cleared!'))
  }

  return (
    <form className="d-grid gap-2" onSubmit={handleSubmit}>
      <button className="btn btn-outline-info" type="submit">
        Reset
      </button>
    </form>
  )
}

export default ResetForm
