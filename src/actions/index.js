import { createAction } from 'redux-actions'
import shortid from 'shortid'

export const SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN'
export const setAccessToken   = createAction(SET_ACCESS_TOKEN)

export const SHOW_AUTH = 'SHOW_AUTH'
export const showAuth  = createAction(SHOW_AUTH)

export const ADD_SCHEDULE = 'ADD_SCHEDULE'
export const addSchedule  = createAction(ADD_SCHEDULE, schedule => {
  schedule.id = shortid.generate()
  return schedule
})

export const UPDATE_SCHEDULE = 'UPDATE_SCHEDULE'
export const updateSchedule  = createAction(UPDATE_SCHEDULE)

export const DELETE_SCHEDULE = 'DELETE_SCHEDULE'
export const deleteSchedule  = createAction(DELETE_SCHEDULE)

export const START_REC = 'START_REC'
export const startRec  = createAction(START_REC)

export const STOP_REC = 'STOP_REC'
export const stopRec  = createAction(STOP_REC)
