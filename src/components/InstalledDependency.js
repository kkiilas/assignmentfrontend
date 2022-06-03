import React from 'react'
import { Link } from 'react-router-dom'

const Dependency = ({ id, name }) => {
  return (
    <Link className="link-info" to={`/${id}`}>
      <h5>{name}</h5>
    </Link>
  )
}

export default Dependency
