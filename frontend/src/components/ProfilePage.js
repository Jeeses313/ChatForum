import React, { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import { USER } from '../queries/userqueries'
import { useHistory } from 'react-router-dom'
import { Button, Image } from 'react-bootstrap'
import { SET_PROFILEPIC, DELETE_PROFILEPIC } from '../queries/userqueries'
import { setNotification } from '../reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from '@apollo/client'
import Chat from './Chat'
import { Row, Col } from 'react-bootstrap'

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
    const [image, setImage] = useState(<></>)
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
    const submitSetImage = () => {
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
        }
    }, [profilePicResult.data]) // eslint-disable-line
    const [deleteProfilePic, deleteProfilePicResult] = useMutation(DELETE_PROFILEPIC, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitDeleteImage = () => {
        if (window.confirm('Delete profile picture?')) {
            deleteProfilePic()
        }
    }
    useEffect(() => {
        if (deleteProfilePicResult.data) {
            dispatch(setNotification({ message: 'Profile picture deleted', error: false }, 10))
            setUser({ ...user, imageUrl: null })
            setImageUrl('')
            setEditImageUrl(false)
            setImage(<></>)
        }
    }, [deleteProfilePicResult.data]) // eslint-disable-line
    const stopEditing = () => {
        setEditImageUrl(false)
        setImageUrl('')
    }
    useEffect(() => {
        if (user && user.imageUrl) {
            setImage(<><Image style={{ height: '100%', width: '100%' }} src={user.imageUrl} fluid></Image><br /></>)
        }
    }, [user])
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return (
        <>
            {user ?
                <Row>
                    <Col md="3">
                        <Row >
                            <div>{image}</div>
                        </Row>
                        <Row>
                            <h2 style={{ marginBottom: '0px' }}>{user.username}</h2>
                        </Row>
                        <Row>
                            Joined: {new Date(user.joinDate).toLocaleDateString([], options)}
                        </Row>
                        <Row >
                            {user.username === currentUser.username ?
                                <>
                                    {editImageUrl ?
                                        <>
                                            <Row>
                                                <input type='text' placeholder='Url of the image...' value={imageUrl} onChange={({ target }) => setImageUrl(target.value)}></input>
                                            </Row>
                                            <Row>
                                                <Button type='button' size='sm' onClick={stopEditing}>Back</Button>
                                                {user.imageUrl ?
                                                    <Button type='button' size='sm' onClick={submitDeleteImage}>Delete image</Button>
                                                    :
                                                    <></>
                                                }
                                                <Button type='button' size='sm' onClick={submitSetImage}>Submit image</Button>
                                            </Row>
                                        </>
                                        :
                                        <Button type='button' size='sm' onClick={() => setEditImageUrl(true)}>Set image</Button>
                                    }
                                </>
                                :
                                <></>
                            }
                        </Row>
                    </Col>
                    <Col md="9">
                        <div>
                            <Chat title={`userChat${username}`}></Chat>
                        </div>
                    </Col>
                </Row>
                :
                <></>
            }
        </>
    )
}

export default ProfilePage