import { createStore, combineReducers, applyMiddleware } from 'redux'
import notificationReducer from './reducers/notificationReducer'
import userReducer from './reducers/userReducer'
import tokenReducer from './reducers/tokenReducer'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'

const reducer = combineReducers({
    notification: notificationReducer,
    user: userReducer,
    token: tokenReducer
})

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(thunk))
)

export default store