import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Alert } from 'react-bootstrap'
import { setNotification } from '../reducers/notificationReducer'

const Notification = () => {
    const notification = useSelector(state => state.notification)
    const style = { position: 'absolute', width: '100%', textAlign: 'center', zIndex:9999 }
    const dispatch = useDispatch()
    const clearAlert = () => {
        dispatch(setNotification(''))
    }
    if (notification === '') {
        return (
            <></>
        )
    }
    if (notification.error) {
        return (
            <Alert style={style} variant="danger" className='errormessage' onClick={clearAlert}>{notification.message}</Alert>
        )
    }
    return (
        <Alert style={style} variant="success" className='message' onClick={clearAlert}>{notification.message}</Alert>
    )
}

export default Notification