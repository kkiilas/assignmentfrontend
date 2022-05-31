import { createSlice } from '@reduxjs/toolkit'

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
      .map((dep, id) => {
        const name = dep.name
        return { id, name }
      })
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

const parseParts = (parts) => {
  const signifiers = parts[0]
    .split('\r\n')
    .map((row) => {
      return row.split(' = ')
    })
    .map((entry) => {
      return { key: entry[0], value: entry[1].replaceAll(`"`, '') }
    })
    .filter((e) => ['name', 'description'].includes(e.key))
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
      const { name, description, dependencies, extras } = parseParts(parts)
      const { required, optional } = parseDepsAndExtras(dependencies, extras)
      return { name, description, required, optional }
    })
    .sort((p1, p2) => p1.name - p2.name)
    .map((p, id) => {
      return { ...p, id: id }
    })
  return packages
}

const addOptionalInstalled = (packages) => {
  const packagesOptionalInstalled = packages.map((p) => {
    if (p.optional) {
      const optionalInstalled = p.optional.map((o, id) => {
        const name = o
        const installed = packages
          .map((p) => p.name.toLowerCase())
          .includes(name.toLowerCase())
        return { id, name, installed }
      })
      return { ...p, optional: optionalInstalled }
    }
    return p
  })
  return packagesOptionalInstalled
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
        return { name, id }
      })
      return { ...p, reverse }
    }
    return { ...p, reverse: null }
  })
  return packagesWithReverseDep
}

export const parse = (text) => {
  const packages = parseAttributes(text)
  const packagesOptionalInstalled = addOptionalInstalled(packages)
  const packagesWithReverseDep = addReverseDep(packagesOptionalInstalled)
  return (dispatch) => {
    dispatch(updatePackages(packagesWithReverseDep))
  }
}

export default packageSlice.reducer
