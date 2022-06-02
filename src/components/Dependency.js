import React from 'react'
import InstalledDependency from './InstalledDependency'

const Dependency = ({ name, installed }) => {
  if (installed) {
    return <InstalledDependency name={name} />
  }
  return <h5>{name}</h5>
}

export default Dependency
