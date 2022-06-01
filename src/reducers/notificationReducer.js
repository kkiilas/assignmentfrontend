import { createSlice } from '@reduxjs/toolkit'

let timeoutID

const initialState = null

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    startNotification(state, action) {
      return action.payload
    },
    clearNotification() {
      return null
    }
  }
})

export const { startNotification, clearNotification } =
  notificationSlice.actions

export const setNotification = (notification) => {
  return (dispatch) => {
    clearTimeout(timeoutID)
    dispatch(startNotification(notification))
    timeoutID = setTimeout(() => {
      dispatch(clearNotification())
    }, 5000)
  }
}

export default notificationSlice.reducer
