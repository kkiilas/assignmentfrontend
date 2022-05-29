import React from 'react'
import { Link } from 'react-router-dom'

const Dependency = ({ name }) => {
  return (
    <Link className="link-info" to={`/${name}`}>
      <h5>{name}</h5>
    </Link>
  )
}

export default Dependency
