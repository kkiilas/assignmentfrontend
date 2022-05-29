import React from 'react'
import Dependency from './Dependency'

const Dependencies = ({ header, dependencies }) => {
  if (!dependencies) {
    return null
  }

  return (
    <div className="pb-3">
      <h3>{header}</h3>
      {dependencies.map((dependency) => (
        <Dependency key={dependency.id} name={dependency.name} />
      ))}
    </div>
  )
}

export default Dependencies
