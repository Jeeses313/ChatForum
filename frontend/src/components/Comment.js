import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useDispatch, useSelector } from 'react-redux'
import { setNotification } from '../reducers/notificationReducer'
import { Button, Image } from 'react-bootstrap'
import { DELETE_COMMENT, EDIT_COMMENT } from '../queries/commentqueries'
import { Link } from 'react-router-dom'

const Comment = ({ comment }) => {
    const dispatch = useDispatch()
    const currentUser = useSelector(state => state.user)
    const [content, setContent] = useState(comment.content)
    const [editing, setEditing] = useState(false)
    const [deleteComment, deleteResult] = useMutation(DELETE_COMMENT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const [editComment, editResult] = useMutation(EDIT_COMMENT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitDelete = () => {
        if (window.confirm('Delete comment?')) {
            deleteComment({ variables: { commentId: comment.id } })
        }
    }
    useEffect(() => {
        if (deleteResult.data) {
            dispatch(setNotification({ message: 'Comment deleted', error: false }, 10))
        }
    }, [deleteResult.data]) // eslint-disable-line
    let image = <></>
    if (comment.imageUrl) {
        image = <><Image src={comment.imageUrl} fluid></Image><br /></>
    }
    const submitEdit = () => {
        if (window.confirm('Edit comment?')) {
            editComment({ variables: { commentId: comment.id, content: content } })
        }
    }
    useEffect(() => {
        if (editResult.data) {
            setEditing(false)
            dispatch(setNotification({ message: 'Comment edited', error: false }, 10))
        }
    }, [editResult.data]) // eslint-disable-line
    const stopEditing = () => {
        setEditing(false)
        setContent(comment.content)
    }
    useEffect(() => {
        setContent(comment.content)
    }, [comment])
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '10px'
    }
    const contentBoxStyle = {
        width: '100%',
        resize: 'none',
        border: 'none'
    }
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    const date = new Date(comment.date).toLocaleTimeString([], options)
    return (
        <div style={styleBox}>
            <div>
                <Link to={`/users/${comment.user.username}`}>{comment.user.username}</Link> {date}
            </div>
            <textarea rows='2' value={content} readOnly={!editing} style={contentBoxStyle} onChange={({ target }) => setContent(target.value)} block='true' />
            {image}
            {(currentUser.username === comment.user.username) && (comment.content !== 'Comment deleted') ?
                <>
                    <Button type='button' size='sm' onClick={submitDelete}>Delete comment</Button>
                    {editing ?
                        <>
                            <Button type='button' size='sm' onClick={stopEditing}>Stop editing</Button>
                            <Button type='button' size='sm' onClick={submitEdit}>Submit edit</Button>
                        </>
                        :
                        <Button type='button' size='sm' onClick={() => setEditing(true)}>Start editing</Button>
                    }
                </>
                :
                <></>
            }
        </div>
    )
}

export default Comment