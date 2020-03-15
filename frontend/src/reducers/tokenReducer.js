const reducer = (state = null, action) => {
    switch (action.type) {
    case 'SET_TOKEN': {
        return action.data
    }
    default: return state
    }
}

export const setToken = (token) => {
    return async dispatch => {
        dispatch({
            type: 'SET_TOKEN',
            data: token
        })
    }
}

export default reducer