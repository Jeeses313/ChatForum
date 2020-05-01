import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { useDispatch, useSelector } from 'react-redux'
import { setNotification } from '../reducers/notificationReducer'
import { Button, Image } from 'react-bootstrap'
import { DELETE_COMMENT, EDIT_COMMENT, REPORT_COMMENT, UNREPORT_COMMENT, ZEROREPORT_COMMENT } from '../queries/commentqueries'
import { Link } from 'react-router-dom'
import CommentMedia from './CommentMedia'

const Comment = ({ comment }) => {
    const dispatch = useDispatch()
    const currentUser = useSelector(state => state.user)
    const mode = useSelector(state => state.mode)
    const [content, setContent] = useState(comment.content)
    const [editing, setEditing] = useState(false)
    const [imageUrl, setImageUrl] = useState(comment.imageUrl)
    useEffect(() => {
        if (!comment.imageUrl) {
            setImageUrl('')
        }
    }, []) // eslint-disable-line
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
        if (deleteResult.called && deleteResult.loading) {
            dispatch(setNotification({ message: 'Comment deleted', error: false }, 10))
        }
    }, [deleteResult]) // eslint-disable-line
    let profileImage = <></>
    if (comment.user.imageUrl) {
        profileImage = <><Image style={{ height: '10%', width: '10%' }} src={comment.user.imageUrl} fluid></Image></>
    }
    const submitEdit = () => {
        if (window.confirm('Edit comment?')) {
            editComment({ variables: { commentId: comment.id, content: content, imageUrl: imageUrl } })
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
        setImageUrl(comment.imageUrl)
        setContent(comment.content)
    }
    const startEditing = () => {
        setEditing(true)
        if (comment.content.endsWith(' -edited')) {
            setContent(comment.content.substring(0, comment.content.length - 8))
        }
    }
    useEffect(() => {
        setContent(comment.content)
    }, [comment])
    const [reportComment, reportResult] = useMutation(REPORT_COMMENT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitReport = () => {
        if (window.confirm('Report comment?')) {
            reportComment({ variables: { commentId: comment.id } })
        }
    }
    useEffect(() => {
        if (reportResult.data) {
            dispatch(setNotification({ message: 'Comment reported', error: false }, 10))
        }
    }, [reportResult.data]) // eslint-disable-line
    const [unreportComment, unreportResult] = useMutation(UNREPORT_COMMENT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitUnreport = () => {
        if (window.confirm('Unreport comment?')) {
            unreportComment({ variables: { commentId: comment.id } })
        }
    }
    useEffect(() => {
        if (unreportResult.data) {
            dispatch(setNotification({ message: 'Comment unreported', error: false }, 10))
        }
    }, [unreportResult.data]) // eslint-disable-line
    const [zeroReportComment, zeroReportResult] = useMutation(ZEROREPORT_COMMENT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitZeroReport = () => {
        if (window.confirm('Zero comment\'s reports?')) {
            zeroReportComment({ variables: { commentId: comment.id } })
        }
    }
    useEffect(() => {
        if (zeroReportResult.called && zeroReportResult.loading) {
            dispatch(setNotification({ message: 'Comment\'s reports zeroed', error: false }, 10))
        }
    }, [zeroReportResult]) // eslint-disable-line
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
    const urlStyle = { borderColor: 'grey', width: '100%' }
    if (mode === 'light') {
        contentBoxStyle.backgroundColor = 'white'
        urlStyle.backgroundColor = 'white'
    } else {
        contentBoxStyle.backgroundColor = 'darkgray'
        urlStyle.backgroundColor = 'darkgray'
    }
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    const date = new Date(comment.date).toLocaleTimeString([], options)
    return (
        <div style={styleBox}>
            <div>
                {profileImage} <Link to={`/users/${comment.user.username}`}>{comment.user.username}</Link>{comment.user.admin ? <span>(admin)</span> : <></>} {date}
                {currentUser.admin ?
                    <> Reports: {comment.reports.length}</>
                    :
                    <></>
                }
            </div>
            <textarea rows='2' value={content} readOnly={!editing} style={contentBoxStyle} onChange={({ target }) => setContent(target.value)} block='true' />
            <CommentMedia imageUrl={comment.imageUrl} hasVideo={comment.hasVideo}></CommentMedia>
            {editing ?
                <>
                    <input type='text' style={urlStyle} placeholder="Image/video url..." value={imageUrl} onChange={({ target }) => setImageUrl(target.value)} block='true'></input><br />
                </>
                :
                <></>
            }
            {(currentUser.username !== comment.user.username) && !currentUser.admin && (comment.content !== 'Comment deleted') ?
                <>
                    {comment.reports.includes(currentUser.id) ?
                        <Button type='button' size='sm' onClick={submitUnreport}>Unreport</Button>
                        :
                        <Button type='button' size='sm' onClick={submitReport}>Report</Button>
                    }
                </>
                :
                <></>
            }
            {currentUser.admin ?
                <>
                    {comment.reports.length > 0 ?
                        <Button type='button' size='sm' onClick={submitZeroReport}>Zero reports</Button>
                        :
                        <></>
                    }
                </>
                :
                <></>
            }
            {(currentUser.username === comment.user.username || currentUser.admin) && (comment.content !== 'Comment deleted') ?
                <>
                    <Button type='button' size='sm' onClick={submitDelete}>Delete comment</Button>
                    {editing ?
                        <>
                            <Button type='button' size='sm' onClick={stopEditing}>Stop editing</Button>
                            <Button type='button' size='sm' onClick={submitEdit}>Submit edit</Button>
                        </>
                        :
                        <>
                            {(currentUser.username === comment.user.username) ?
                                <Button type='button' size='sm' onClick={startEditing}>Start editing</Button>
                                :
                                <></>
                            }
                        </>
                    }
                </>
                :
                <></>
            }
        </div>
    )
}

export default Comment