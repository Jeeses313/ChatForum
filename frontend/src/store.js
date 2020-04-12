import { createStore, combineReducers, applyMiddleware } from 'redux'
import notificationReducer from './reducers/notificationReducer'
import userReducer from './reducers/userReducer'
import tokenReducer from './reducers/tokenReducer'
import modeReducer from './reducers/modeReducer'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'

const reducer = combineReducers({
    notification: notificationReducer,
    user: userReducer,
    token: tokenReducer,
    mode: modeReducer
})

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(thunk))
)

export default store