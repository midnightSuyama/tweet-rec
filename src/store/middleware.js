import {
  SET_ACCESS_TOKEN,
  ADD_SCHEDULE,
  UPDATE_SCHEDULE,
  DELETE_SCHEDULE,

  startRec,
  stopRec
} from '../actions'

import notifier from 'node-notifier'

const createJob = (store, schedule) => {
  global.tweetRec.createJob(schedule, () => {
    // onStart
    store.dispatch(startRec(schedule))
    notifier.notify({
      title: 'tweet-rec',
      message: `REC START: #${schedule.word}`
    })
  }, () => {
    // onStop
    store.dispatch(stopRec())
    notifier.notify({
      title: 'tweet-rec',
      message: `REC STOP: #${schedule.word}`
    })
  }, () => {
    // onError
    store.dispatch(stopRec())
    notifier.notify({
      title: 'tweet-rec',
      message: `REC ERROR: #${schedule.word}`
    })
  })
}

export default store => next => action => {
  switch(action.type) {
  case SET_ACCESS_TOKEN: {
    let accessToken = action.payload
    global.tweetRec.setupTwitter(
      process.env.twitter_consumer_key,
      process.env.twitter_consumer_secret,
      accessToken.twitter_access_token_key,
      accessToken.twitter_access_token_secret
    )
    next(action)
  } break

  case ADD_SCHEDULE: {
    next(action)
    let schedule = action.payload
    createJob(store, schedule)
  } break
    
  case UPDATE_SCHEDULE: {
    let schedule = action.payload
    global.tweetRec.destroyJob(schedule.id)
    next(action)
    createJob(store, schedule)
  } break

  case DELETE_SCHEDULE: {
    let id = action.payload
    global.tweetRec.destroyJob(id)
    next(action)
  } break

  default:
    next(action)
  }
}
