import React, { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import { USER } from '../queries/userqueries'
import { useHistory } from 'react-router-dom'
import { Button, Image } from 'react-bootstrap'

const ProfilePage = () => {
    const history = useHistory()
    const match = useRouteMatch('/users/:username')
    const [user, setUser] = useState(null)
    const username = match ? match.params.username : null
    const [loadUser, userResult] = useLazyQuery(USER)
    useEffect(() => {
        loadUser({ variables: { username } })
    }, [username]) //eslint-disable-line
    useEffect(() => {
        if (userResult.data) {
            setUser(userResult.data.user)
        } else if (userResult.called && !userResult.loading) {
            history.push('/error/User does not exist')
        }
    }, [userResult]) //eslint-disable-line
    let image = <></>
    if (user && user.imageUrl) {
        image = <><Image src={user.imageUrl} fluid></Image><br /></>
    }
    return (
        <>
            {user ?
                <>
                    {image}
                    <h2>{user.username}</h2>
                </>
                :
                <></>
            }
        </>
    )
}

export default ProfilePage