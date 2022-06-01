import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { parse, clearPackages } from '../reducers/packageReducer'
import { setNotification } from '../reducers/notificationReducer'

const Form = () => {
  let fileInput = useRef()
  const dispatch = useDispatch()

  const validateFileByName = (name) => {
    if (name !== 'poetry.lock') {
      dispatch(
        setNotification(
          `Wrong format. The name of the file must by "poetry.lock".`
        )
      )
      return
    }
    dispatch(setNotification('File accepted'))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(clearPackages())
    const file = fileInput.current.files[0]
    const name = file.name
    validateFileByName(name)
    const text = await file.text()
    dispatch(parse(text))
  }

  return (
    <form className="d-grid gap-2" onSubmit={handleSubmit}>
      <input
        className="bg-dark text-white border border-info"
        type="file"
        ref={fileInput}
      />
      <button className="btn btn-outline-info" type="submit">
        Submit
      </button>
    </form>
  )
}

export default Form
