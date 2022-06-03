import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Packages = () => {
  const packages = useSelector((state) => [...state.packages])
  if (packages.length === 0) {
    return null
  }

  return (
    <div className="d-flex flex-column align-items-center">
      {packages.map((p) => (
        <div key={p.id}>
          <Link className="link-info" to={`/${p.id}`}>
            <h5>{p.name}</h5>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Packages
