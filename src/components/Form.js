import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { parse, clearPackages } from '../reducers/packageReducer'
import { setNotification } from '../reducers/notificationReducer'
import fileService from '../services/fileService'

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
      return false
    }
    dispatch(setNotification('File accepted!'))
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(clearPackages())
    const file = fileInput.current.files[0]
    const name = file.name
    if (validateFileByName(name)) {
      const text = await fileService.getText(file)
      dispatch(parse(text))
    }
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
