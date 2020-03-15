import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries/userqueries'
import Notification from './Notification'
import { setNotification } from '../reducers/notificationReducer'
import { setToken } from '../reducers/tokenReducer'
import { setUser } from '../reducers/userReducer'
import { useDispatch } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'

const LoginForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    const history = useHistory()
    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            const user = result.data.login.user
            dispatch(setToken(token))
            localStorage.setItem('user-token', token)
            history.push('/')
            localStorage.setItem('logged-user', JSON.stringify(user))
            dispatch(setUser(user))
            dispatch(setNotification({ message: 'Logged in', error: false }, 10))
        }
    }, [result.data]) // eslint-disable-line
    const submit = (event) => {
        event.preventDefault()
        login({ variables: { username, password } })
        setUsername('')
        setPassword('')
    }

    return (
        <>
            <h2>Login</h2>
            <Notification></Notification>
            <Form onSubmit={submit}>
                <Form.Label>username:</Form.Label>
                <Form.Control type="text" id='username' value={username} name="username" onChange={({ target }) => setUsername(target.value)} required />
                <Form.Label>password:</Form.Label>
                <Form.Control type="password" id='password' value={password} name="password" onChange={({ target }) => setPassword(target.value)} required />
                <Button id='submit' type="submit">login</Button> or <Link to='/signin'>signin</Link>
            </Form>
        </>
    )
}

export default LoginForm