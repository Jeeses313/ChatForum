const reducer = (state = '', action) => {
    switch (action.type) {
    case 'SET NOTIFICATION': {
        return action.notification
    }
    default: return state
    }
}

let timeout

export const setNotification = (notification, time) => {
    return async dispatch => {
        if (notification !== '') {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                dispatch(setNotification(''))
            }, time * 1000)
        }
        dispatch({
            type: 'SET NOTIFICATION',
            notification: notification
        })
    }
}

export default reducer