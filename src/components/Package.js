import React from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Dependencies from './Dependencies'
import OptionalDependencies from './OptionalDependencies'

const Package = () => {
  const params = useParams()
  const packages = useSelector((state) => state.packages)
  if (packages.length === 0) {
    return <Navigate replace to="/" />
  }
  const p = packages.find(
    (p) => p.name.toLowerCase() === params.name.toLowerCase()
  )
  if (!p) {
    return <Navigate replace to="/" />
  }

  const required = p.required
  const optional = p.optional
  const reverse = p.reverse

  return (
    <div className="container bg-dark">
      <div className="container bg-dark bg-gradient">
        <div className="d-flex flex-column bg-dark p-5 min-vh-100">
          <Link to="/" className="link-info">
            Home
          </Link>
          <div className="d-flex flex-column">
            <h1>{p.name}</h1>
            <h5 className="pb-3">{p.description}</h5>
            <Dependencies header="Dependencies" dependencies={required} />
            <OptionalDependencies dependencies={optional} />
            <Dependencies
              header="Reverse Dependencies"
              dependencies={reverse}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Package
