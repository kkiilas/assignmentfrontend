import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'

const initialState = []

const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackages(state, action) {
      return action.payload
    },
    clearPackages() {
      return []
    }
  }
})

export const { clearPackages, setPackages } = packageSlice.actions

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
      const names = trimmedRow
        .split(`", "`)
        .map((name) => name.split(' ')[0])
        .map((name) => name.split('[')[0])
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
      .sort((r1, r2) => r1 - r2)
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

const addIndexAndWhetherInstalledToDependency = (i, name, packages) => {
  const installedPackage = packages.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  )
  const id = installedPackage ? installedPackage.id : packages.length + i
  const installed = installedPackage ? true : false
  return { id, name, installed }
}

const duplicate = (dependency, requiredDeps, optionalDeps) => {
  const id = dependency.id
  const name = dependency.name.toLowerCase()
  return (
    (requiredDeps &&
      requiredDeps.map((dep) => dep.name.toLowerCase()).includes(name)) ||
    optionalDeps.map((od) => od.id).includes(id) ||
    optionalDeps.map((od) => od.name.toLowerCase()).includes(name)
  )
}

const provideDependenciesWithIndices = (packages) => {
  const packagesWithIndexedDeps = packages.map((p) => {
    let required = null
    let optional = []

    if (p.required) {
      required = p.required.map((dependency, i) => {
        const requiredDependency = addIndexAndWhetherInstalledToDependency(
          i,
          dependency,
          packages
        )
        return requiredDependency
      })
    }

    if (p.optional) {
      p.optional.map((dependency, i) => {
        const optionalDependency = addIndexAndWhetherInstalledToDependency(
          i,
          dependency,
          packages
        )
        if (!duplicate(optionalDependency, required, optional)) {
          optional.push(optionalDependency)
        }
      })
    }

    if (optional.length === 0) {
      optional = null
    }

    return { ...p, required, optional }
  })
  return packagesWithIndexedDeps
}

const parseReverse = (packages) => {
  const reverseDepMap = []
  packages.forEach((p) => {
    const required = p.required
    if (required) {
      required.forEach((dep) => {
        const reverseDepEntry = reverseDepMap.find(
          (entry) => entry.key === dep.id
        )
        reverseDepEntry
          ? reverseDepEntry.value.push(p.id)
          : reverseDepMap.push({ key: dep.id, value: [p.id] })
      })
    }
  })
  return reverseDepMap
}

const addReverseDependencies = (packages) => {
  const reverseDepMap = parseReverse(packages)
  const packagesWithReverseDependencies = packages.map((p) => {
    const reverseDepEntry = reverseDepMap.find((entry) => entry.key === p.id)
    if (reverseDepEntry) {
      const reverse = reverseDepEntry.value
        .map((id) => {
          const p = packages.find((p) => p.id === id)
          const name = p.name
          return { id, name, installed: true }
        })
        .sort((rd1, rd2) => rd1.id - rd2.id)
      return { ...p, reverse }
    }
    return { ...p, reverse: null }
  })
  return packagesWithReverseDependencies
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
    const packagesWithReverseDep = addReverseDependencies(
      packagesOptionalInstalled
    )
    window.localStorage.setItem(
      'packages',
      JSON.stringify(packagesWithReverseDep)
    )
    dispatch(setPackages(packagesWithReverseDep))
    dispatch(setNotification('Validation succeeded!'))
  }
}

export default packageSlice.reducer
