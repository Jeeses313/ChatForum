const reducer = (state = 'light', action) => {
    switch (action.type) {
        case 'SET_MODE': {
            localStorage.setItem('mode', action.data)
            return action.data
        }
        default: return state
    }
}

export const setMode = (mode) => {
    return async dispatch => {
        dispatch({
            type: 'SET_MODE',
            data: mode
        })
    }
}

export default reducer