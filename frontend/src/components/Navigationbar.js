import React from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import Notification from './Notification'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../reducers/userReducer'
import { setToken } from '../reducers/tokenReducer'
import { setNotification } from '../reducers/notificationReducer'

const Navigationbar = () => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const history = useHistory()
    const handleLogout = () => {
        window.localStorage.removeItem('user-token')
        window.localStorage.removeItem('logged-user')
        dispatch(setUser(null))
        dispatch(setToken(''))
        dispatch(setNotification({ message: 'logged out', error: false }, 5))
        history.push('/login')
    }
    return (
        <>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Brand href="" as="span">ChatForum</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#" as="span">
                            <Button variant="outline-info" onClick={() => { }}>nothing</Button>
                        </Nav.Link>
                        <Nav.Link href="#" as="span">
                            <div><Link to='/'>{user.username}</Link> logged in <Button variant="outline-info" onClick={handleLogout}>logout</Button></div>
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Notification></Notification>
        </>
    )
}

export default Navigationbar