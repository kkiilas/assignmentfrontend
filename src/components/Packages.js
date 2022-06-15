import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { setPackages } from '../reducers/packageReducer'

const Packages = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const packagesJSON = window.localStorage.getItem('packages')
    if (packagesJSON) {
      const packages = JSON.parse(packagesJSON)
      dispatch(setPackages(packages))
    }
  }, [dispatch])

  const packages = useSelector((state) => [...state.packages])

  if (packages.length === 0) {
    return null
  }

  return (
    <div className="d-flex flex-column align-items-center">
      {packages.map((p) => (
        <div key={p.id}>
          <Link className="link-info" to={`/packages/${p.id}`}>
            <h5>{p.name}</h5>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Packages
