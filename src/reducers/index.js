import { combineReducers } from 'redux'
import { handleActions } from 'redux-actions'
import {
  SET_ACCESS_TOKEN,
  SHOW_AUTH,
  ADD_SCHEDULE,
  UPDATE_SCHEDULE,
  DELETE_SCHEDULE,
  START_REC,
  STOP_REC
} from '../actions'

const sortSchedule = (schedules) => (
  schedules.sort((a, b) => (new Date(`${a.date} ${a.beginTime}`) > new Date(`${b.date} ${b.beginTime}`)))
)

const isAuth = handleActions({
  SET_ACCESS_TOKEN: (state, action) => true,
  SHOW_AUTH: (state, action) => false
}, null)

const schedules = handleActions({
  ADD_SCHEDULE: (state, action) => {
    let schedule = action.payload
    state.push(schedule)
    return sortSchedule(state)
  },
  UPDATE_SCHEDULE: (state, action) => {
    let schedule = action.payload
    state.forEach((e, i) => {
      if (e.id == schedule.id) {
        state[i] = schedule
      }
    })
    return sortSchedule(state)
  },
  DELETE_SCHEDULE: (state, action) => {
    let id = action.payload
    state.forEach((e, i) => {
      if (e.id == id) {
        state.splice(i, 1)
      }
    })
    return state
  },
  START_REC: (state, action) => {
    let schedule = action.payload
    state.forEach((e, i) => {
      if (e.id == schedule.id) {
        state.splice(i, 1)
      }
    })
    return state
  }
}, [])

const recording = handleActions({
  START_REC: (state, action) => action.payload,
  STOP_REC: (state, action) => null
}, null)

export default combineReducers({
  isAuth,
  schedules,
  recording
})
