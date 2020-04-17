import React from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import Notification from './Notification'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../reducers/userReducer'
import { setToken } from '../reducers/tokenReducer'
import { setNotification } from '../reducers/notificationReducer'
import { setMode } from '../reducers/modeReducer'

const Navigationbar = () => {
    const currentUser = useSelector(state => state.user)
    const mode = useSelector(state => state.mode)
    const dispatch = useDispatch()
    const history = useHistory()
    const handleLogout = () => {
        window.localStorage.removeItem('user-token')
        window.localStorage.removeItem('logged-user')
        dispatch(setUser(null))
        dispatch(setToken(''))
        dispatch(setNotification({ message: 'Logged out', error: false }, 5))
        history.push('/login')
    }
    if (currentUser) {
        return (
            <>
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Navbar.Brand href="" as="span">ChatForum</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="#" as="span">
                                <Button variant="outline-info" onClick={() => { history.push('/chats') }}>Chats</Button>
                            </Nav.Link>
                            {currentUser.admin ?
                                <Nav.Link href="#" as="span">
                                    <Button variant="outline-info" onClick={() => { history.push('/reported/chats') }}>Reported chats</Button>
                                </Nav.Link>
                                :
                                <></>
                            }
                            <Nav.Link href="#" as="span">
                                {mode === 'light' ?
                                    <Button variant="outline-info" onClick={() => dispatch(setMode('dark'))}>Dark mode</Button>
                                    :
                                    <Button variant="outline-info" onClick={() => dispatch(setMode('light'))}>Light mode</Button>
                                }
                            </Nav.Link>
                            <Nav.Link href="#" as="span">
                                <div><Link to={`/users/${currentUser.username}`}>{currentUser.username}</Link> logged in <Button variant="outline-info" onClick={handleLogout}>logout</Button></div>
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Notification></Notification>
            </>
        )
    } else {
        return (
            <>
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Navbar.Brand href="" as="span">ChatForum</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="#" as="span">
                                {mode === 'light' ?
                                    <Button variant="outline-info" onClick={() => dispatch(setMode('dark'))}>Dark mode</Button>
                                    :
                                    <Button variant="outline-info" onClick={() => dispatch(setMode('light'))}>Light mode</Button>
                                }
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Notification></Notification>
            </>
        )
    }
}

export default Navigationbar