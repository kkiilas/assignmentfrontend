import { configureStore } from '@reduxjs/toolkit'
import packageReducer from './reducers/packageReducer'

const store = configureStore({
  reducer: {
    packages: packageReducer
  }
})

export default store
