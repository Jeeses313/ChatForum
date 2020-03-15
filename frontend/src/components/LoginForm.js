import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries/userqueries'
import { setNotification } from '../reducers/notificationReducer'
import { setToken } from '../reducers/tokenReducer'
import { setUser } from '../reducers/userReducer'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

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
            <form onSubmit={submit}>
                <div>
                    username <input
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                    password <input
                        type='password'
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button type='submit'>login</button>
            </form>
        </>
    )
}

export default LoginForm