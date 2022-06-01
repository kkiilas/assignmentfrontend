import { configureStore } from '@reduxjs/toolkit'
import packageReducer from './reducers/packageReducer'
import notificationReducer from './reducers/notificationReducer'

const store = configureStore({
  reducer: {
    packages: packageReducer,
    notification: notificationReducer
  }
})

export default store
