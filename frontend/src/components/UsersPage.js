import React, { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Row, Col, Button } from 'react-bootstrap'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { USERS, USER_CREATED } from '../queries/userqueries'
import UserListing from './UserListing'

const UsersPage = () => {
    const mode = useSelector(state => state.mode)
    const [loadUsers, usersResult] = useLazyQuery(USERS)
    const [users, setUsers] = useState([])
    const [usersToShow, setUsersToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [sortByUsername, setSortByUsername] = useState(true)
    const sortUsers = useCallback((userA, userB) => {
        if (sortByUsername) {
            return userA.username.localeCompare(userB.username)
        } else {
            return userA.joinDate - userB.joinDate
        }
    }, [sortByUsername])
    useEffect(() => {
        loadUsers()
    }, []) //eslint-disable-line
    useEffect(() => {
        if (usersResult.data) {
            setUsers(usersResult.data.users.slice(0).sort(sortUsers))
            setUsersToShow(users)
        }
    }, [usersResult.data]) //eslint-disable-line
    useEffect(() => {
        if (filter === '') {
            setUsersToShow(users.slice(0).sort(sortUsers))
        } else {
            setUsersToShow(users.filter(user => user.username.toLowerCase().startsWith(filter.toLowerCase())).sort(sortUsers))
        }
    }, [filter, users, sortByUsername, sortUsers])
    useSubscription(USER_CREATED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const newUser = subscriptionData.data.userCreated
            const newUsers = users.concat(newUser)
            newUsers.sort(sortUsers)
            setUsers(newUsers)
        }
    })
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        borderColor: 'grey',
        padding: '10px',
        marginBottom: '0',
        overflowY: 'scroll',
        height: '82.5vh'
    }
    const filterStyle = { width: '100%', paddingBottom: '0', borderColor: 'grey' }
    if (mode === 'light') {
        filterStyle.backgroundColor = 'white'
    } else {
        filterStyle.backgroundColor = 'darkgray'
    }
    const colStyle = { paddingRight: '0', paddingLeft: '0' }
    return (
        <div style={{ height: '100%' }}>
            <Row>
                <Col md="8" style={colStyle}>
                    <h2 style={{ display: 'inline-block', marginBottom: '0' }}>
                        Users&nbsp;
                        {sortByUsername ?
                            <Button type='button' size='sm' onClick={() => setSortByUsername(false)}>Sort by: joined date</Button>
                            :
                            <Button type='button' size='sm' onClick={() => setSortByUsername(true)}>Sort by: username</Button>
                        }
                    </h2>
                </Col>
                <Col md="4" style={colStyle}>
                    <input style={filterStyle} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter users by username...'></input>
                </Col>
            </Row>
            <Row>
                <Col style={colStyle}>
                    <div style={styleBox}>
                        {usersToShow.map(user =>
                            <UserListing key={user.username} user={user}></UserListing>
                        )}
                    </div>
                </Col>
            </Row>
        </div >
    )
}

export default UsersPage