import { createStore, applyMiddleware } from 'redux'
import middleware from './middleware'
import reducer from '../reducers'

const createStoreWithMiddleware = applyMiddleware(middleware)(createStore)

export default createStoreWithMiddleware(reducer)
