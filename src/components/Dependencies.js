import React from 'react'
import Dependency from './Dependency'

const Dependencies = ({ header, dependencies }) => {
  if (!dependencies) {
    return null
  }

  const compare = (d1, d2) => {
    const name1 = d1.name.toLowerCase()
    const name2 = d2.name.toLowerCase()
    return name1 < name2 ? -1 : name1 > name2 ? 1 : 0
  }

  const sortedDependencies = [...dependencies].sort(compare)

  return (
    <div className="pb-3">
      <h3>{header}</h3>
      {sortedDependencies.map((dependency) => (
        <Dependency
          key={dependency.id}
          id={dependency.id}
          name={dependency.name}
          installed={dependency.installed}
        />
      ))}
    </div>
  )
}

export default Dependencies
