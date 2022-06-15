import React from 'react'
import { useSelector } from 'react-redux'
import UploadForm from './UploadForm'
import ResetForm from './ResetForm'

const Forms = () => {
  const packages = useSelector((state) => state.packages)
  const formToShow = packages.length === 0 ? <UploadForm /> : <ResetForm />
  return <div>{formToShow}</div>
}

export default Forms
