import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { SIGNIN } from '../queries/userqueries'
import Notification from './Notification'
import { setNotification } from '../reducers/notificationReducer'
import { setToken } from '../reducers/tokenReducer'
import { setUser } from '../reducers/userReducer'
import { useDispatch } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'

const SigninForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    const history = useHistory()
    const [signin, result] = useMutation(SIGNIN, {
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    useEffect(() => {
        if (result.data) {
            const token = result.data.createUser.value
            const user = result.data.createUser.user
            dispatch(setToken(token))
            localStorage.setItem('user-token', token)
            history.push('/')
            localStorage.setItem('logged-user', JSON.stringify(user))
            dispatch(setUser(user))
            dispatch(setNotification({ message: 'Signed in', error: false }, 10))
        }
    }, [result.data]) // eslint-disable-line
    const submit = (event) => {
        event.preventDefault()
        signin({ variables: { username, password } })
        setUsername('')
        setPassword('')
    }
    return (
        <>
            <h2>Signin</h2>
            <Notification></Notification>
            <Form onSubmit={submit}>
                <Form.Label>username:</Form.Label>
                <Form.Control type="text" id='username' value={username} name="username" onChange={({ target }) => setUsername(target.value)} required />
                <Form.Label>password:</Form.Label>
                <Form.Control type="password" id='password' value={password} name="password" onChange={({ target }) => setPassword(target.value)} required />
                <Button id='submit' type="submit">signin</Button> or <Link to='/login'>login</Link>
            </Form>
        </>
    )
}

export default SigninForm