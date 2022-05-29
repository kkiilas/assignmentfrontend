import React from 'react'
import Optional from './Optional'

const OptionalDependencies = ({ dependencies }) => {
  if (!dependencies) {
    return null
  }

  return (
    <div className="pb-3">
      <h3>Optional Dependencies</h3>
      {dependencies.map((dependency) => (
        <Optional
          key={dependency.id}
          name={dependency.name}
          installed={dependency.installed}
        />
      ))}
    </div>
  )
}

export default OptionalDependencies
