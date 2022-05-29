import React from 'react'
import Dependency from './Dependency'

const Optional = ({ name, installed }) => {
  if (installed) {
    return <Dependency name={name} />
  }
  return <h5>{name}</h5>
}

export default Optional
