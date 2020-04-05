import React, { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import { USER } from '../queries/userqueries'
import { useHistory } from 'react-router-dom'
import { Button, Image } from 'react-bootstrap'
import { SET_PROFILEPIC } from '../queries/userqueries'
import { setNotification } from '../reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@apollo/client'
import Chat from './Chat'

const ProfilePage = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const currentUser = useSelector(state => state.user)
    const match = useRouteMatch('/users/:username')
    const [user, setUser] = useState(null)
    const [imageUrl, setImageUrl] = useState('')
    const [editImageUrl, setEditImageUrl] = useState(false)
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
    const [setProfilePic, profilePicResult] = useMutation(SET_PROFILEPIC, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submit = () => {
        if (window.confirm('Set profile picture?')) {
            setProfilePic({ variables: { imageUrl } })
        }
    }
    useEffect(() => {
        if (profilePicResult.data) {
            dispatch(setNotification({ message: 'Profile picture set', error: false }, 10))
            setUser({ ...user, imageUrl: profilePicResult.data.setUserProfilePic.imageUrl })
            setImageUrl('')
            setEditImageUrl(false)
            setImage(<><Image style={{ height: '10%', width: '10%' }} src={profilePicResult.data.setUserProfilePic.imageUrl} fluid></Image><br /></>)
        }
    }, [profilePicResult.data]) // eslint-disable-line
    const stopEditing = () => {
        setEditImageUrl(false)
        setImageUrl('')
    }
    const [image, setImage] = useState(<></>)
    useEffect(() => {
        if (user && user.imageUrl) {
            setImage(<><Image style={{ height: '100%', width: '100%' }} src={user.imageUrl} fluid></Image><br /></>)
        }
    }, [user])
    return (
        <>
            {user ?
                <div className="row">
                    <div className="col-3">
                        <div className="row" >
                            <div>{image}</div>
                        </div>
                        <div className="row">
                            <h2>{user.username}</h2>
                        </div>
                        <div className="row" >
                            {user.username === currentUser.username ?
                                <>
                                    {editImageUrl ?
                                        <>
                                            <div className="row">
                                                <input type='text' placeholder='Url of the image...' value={imageUrl} onChange={({ target }) => setImageUrl(target.value)}></input>
                                            </div>
                                            <div className="row">
                                                <Button type='button' size='sm' onClick={stopEditing}>Back</Button>
                                                <Button type='button' size='sm' onClick={submit}>Submit image</Button>
                                            </div>
                                        </>
                                        :
                                        <Button type='button' size='sm' onClick={() => setEditImageUrl(true)}>Set image</Button>
                                    }
                                </>
                                :
                                <></>
                            }
                        </div>
                    </div>
                    <div className="col-9">
                        <Chat title={`userChat${username}`}></Chat>
                    </div>
                </div>
                :
                <></>
            }
        </>
    )
}

export default ProfilePage