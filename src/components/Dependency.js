import React from 'react'
import InstalledDependency from './InstalledDependency'

const Dependency = ({ id, name, installed }) => {
  if (installed) {
    return <InstalledDependency id={id} name={name} />
  }
  return <h5>{name}</h5>
}

export default Dependency
