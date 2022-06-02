import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'

const initialState = []

const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    updatePackages(state, action) {
      return action.payload
    },
    clearPackages() {
      return []
    }
  }
})

export const { clearPackages, updatePackages } = packageSlice.actions

const parseParts = (parts) => {
  const signifiers = parts[0]
    .split('\r\n')
    .map((row) => {
      return row.split(' = ')
    })
    .filter((entry) => entry.length > 1)
    .map((entry) => {
      return { key: entry[0], value: entry[1].replaceAll(`"`, '') }
    })
    .filter((entry) => ['name', 'description'].includes(entry.key))
  if (signifiers.length === 0) {
    return null
  }
  const name = signifiers[0].value
  const description = signifiers[1].value
  let dependencies = null
  let extras = null
  const depsHeader = '[package.dependencies]\r\n'
  const lengthOfExtrasHeader = '[package.extras]\r\n'.length
  if (parts.length === 3) {
    dependencies = parts[1].substring(depsHeader.length)
    extras = parts[2].substring(lengthOfExtrasHeader)
  } else if (parts.length === 2) {
    if (parts[1].includes(depsHeader)) {
      dependencies = parts[1].substring(depsHeader.length)
    } else {
      extras = parts[1].substring(lengthOfExtrasHeader)
    }
  }
  return { name, description, dependencies, extras }
}

const parseDependencies = (text) => {
  return text.split('\r\n').map((dep) => {
    const optional = dep.includes('optional = true')
    const name = dep.split(' = ')[0]
    return {
      name,
      optional
    }
  })
}

const parseExtras = (text) => {
  const extras = text
    .split('\r\n')
    .map((extra) => {
      const row = extra.split(' = ')[1]
      const trimmedRow = row.substring(2, row.length - 2)
      const names = trimmedRow.split(`", "`).map((name) => name.split(' ')[0])
      return names
    })
    .flat()
  return extras
}

const regroupDepsAndExtras = (dependencies, extras) => {
  let required = []
  if (dependencies) {
    required = dependencies
      .filter((dep) => !dep.optional)
      .map((dep) => dep.name)
  }
  if (required.length === 0) {
    required = null
  }
  let optional = []
  if (dependencies !== null) {
    const optionalDeps = dependencies
      .filter((dep) => dep.optional)
      .map((dep) => dep.name)
    optional = optional.concat(optionalDeps)
  }
  if (extras !== null) {
    extras
      .filter((extra) => !optional.includes(extra))
      .forEach((extra) => optional.push(extra))
  }
  if (optional.length === 0) {
    optional = null
  }
  return { required, optional }
}

const parseDepsAndExtras = (dependencies, extras) => {
  if (dependencies) {
    dependencies = parseDependencies(dependencies)
  }
  if (extras) {
    extras = parseExtras(extras)
  }
  const regrouped = regroupDepsAndExtras(dependencies, extras)
  return regrouped
}

const parseAttributes = (text) => {
  const packages = text
    .split('\r\n\r\n[[package]]\r\n')
    .map((element) => {
      const startOfFile = '[[package]]\r\n'
      if (element.includes(startOfFile)) {
        element = element.substring(startOfFile.length)
      }
      if (element.includes('\r\n\r\n[metadata]')) {
        element = element.split('\r\n\r\n[metadata]')[0]
      }
      const parts = element.split('\r\n\r\n')
      const parsedParts = parseParts(parts)
      if (parsedParts) {
        const { name, description, dependencies, extras } = parsedParts
        const { required, optional } = parseDepsAndExtras(dependencies, extras)
        return { name, description, required, optional }
      }
      return null
    })
    .filter((p) => p !== null)
    .sort((p1, p2) => p1.name - p2.name)
    .map((p, id) => {
      return { ...p, id }
    })
  return packages
}

const provideDependencyWithIndexAndWhetherInstalled = (i, name, packages) => {
  const installedPackage = packages.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  )
  const id = installedPackage ? installedPackage.id : packages.length + i
  const installed = installedPackage ? true : false
  return { id, name, installed }
}

const provideDependenciesWithIndices = (packages) => {
  const packagesWithIndexedDeps = packages.map((p) => {
    let required = p.required
    let optional = p.optional

    if (required) {
      required = required.map((dependency, i) => {
        const requiredDependency =
          provideDependencyWithIndexAndWhetherInstalled(i, dependency, packages)
        return requiredDependency
      })
    }

    if (optional) {
      optional = p.optional.map((dependency, i) => {
        const optionalDependency =
          provideDependencyWithIndexAndWhetherInstalled(i, dependency, packages)
        return optionalDependency
      })
    }

    return { ...p, required, optional }
  })
  return packagesWithIndexedDeps
}

const parseReverse = (packages) => {
  const reverseDep = []
  packages.forEach((p) => {
    if (p.required) {
      p.required.forEach((dep) => {
        reverseDep.find((e) => e.key.toLowerCase() === dep.name.toLowerCase())
          ? reverseDep
              .find((e) => e.key.toLowerCase() === dep.name.toLowerCase())
              .value.push(p.name)
          : reverseDep.push({ key: dep.name, value: [p.name] })
      })
    }
  })
  return reverseDep
}

const addReverseDep = (packages) => {
  const reverseDep = parseReverse(packages)
  const packagesWithReverseDep = packages.map((p) => {
    const entry = reverseDep.find(
      (rd) => rd.key.toLowerCase() === p.name.toLowerCase()
    )
    if (entry) {
      const reverse = entry.value.map((name, id) => {
        return { name, id, installed: true }
      })
      return { ...p, reverse }
    }
    return { ...p, reverse: null }
  })
  return packagesWithReverseDep
}

export const parse = (text) => {
  const packages = parseAttributes(text)
  return (dispatch) => {
    if (packages.length === 0) {
      dispatch(
        setNotification(
          'No packages found! Double check the file you submitted. An example of a poetry.lock -file: https://github.com/python-poetry/poetry/blob/70e8e8ed1da8c15041c3054603088fce59e05829/poetry.lock'
        )
      )
      return
    }
    const packagesOptionalInstalled = provideDependenciesWithIndices(packages)
    const packagesWithReverseDep = addReverseDep(packagesOptionalInstalled)
    dispatch(updatePackages(packagesWithReverseDep))
    dispatch(setNotification('Validation succeeded!'))
  }
}

export default packageSlice.reducer
