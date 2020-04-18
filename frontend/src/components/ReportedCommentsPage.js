import React, { useState, useEffect, useRef } from 'react'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { COMMENT_DELETED, COMMENT_EDITED, COMMENT_REPORTED, REPORTED_COMMENTS } from '../queries/commentqueries'
import Comment from './Comment'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ReportedCommentsPage = () => {
    const [comments, setComments] = useState([])
    const history = useHistory()
    const mode = useSelector(state => state.mode)
    const currentUser = useSelector(state => state.user)
    const [commentsToShow, setCommentsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [loadComments, commentsResult] = useLazyQuery(REPORTED_COMMENTS)
    const commentsEndRef = useRef(null)
    const sortComments = (commentA, commentB) => {
        if (commentA.reports.length !== commentB.reports.length) {
            return commentB.reports.length - commentA.reports.length
        }
        return commentA.date - commentB.date
    }
    const scrollToBottom = () => {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    useEffect(() => {
        if (!currentUser.admin) {
            history.push('/error/Not authorized')
        }
        loadComments()
    }, []) //eslint-disable-line
    useEffect(() => {
        if (commentsResult.data) {
            setComments(commentsResult.data.reportedComments.sort(sortComments))
        }
    }, [commentsResult]) //eslint-disable-line
    useEffect(scrollToBottom, [comments, commentsToShow])
    useSubscription(COMMENT_DELETED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const deletedComment = subscriptionData.data.commentDeleted
            setComments(comments.filter(comment => comment.id !== deletedComment.id))
        }
    })
    useSubscription(COMMENT_EDITED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const editedComment = subscriptionData.data.commentEdited
            setComments(comments.map(comment => comment.id === editedComment.id ? { ...comment, content: editedComment.content, imageUrl: editedComment.imageUrl, hasVideo: editedComment.hasVideo } : comment))
        }
    })
    useEffect(() => {
        if (filter === '') {
            setCommentsToShow(comments)
        } else {
            setCommentsToShow(comments.filter(comment => comment.content.toLowerCase().includes(filter.toLowerCase())))
        }
    }, [filter, comments])
    useSubscription(COMMENT_REPORTED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const reportedComment = subscriptionData.data.commentReported
            let newComments = []
            if (comments.map(comment => comment.id).includes(reportedComment.id)) {
                newComments = comments.map(comment => comment.id === reportedComment.id ? { ...comment, reports: reportedComment.reports } : comment)
            } else {
                newComments = comments.concat(reportedComment)
            }
            newComments.sort(sortComments)
            setComments(newComments.filter(comment => comment.reports.length > 0))
        }
    })
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        borderColor: 'grey',
        padding: '10px',
        marginBottom: '0',
        overflowY: 'scroll',
        height: '70vh',
        width: '100%'
    }
    const filterStyle = { float: 'right', width: '30%', paddingBottom: '0', borderColor: 'grey' }
    if (mode === 'light') {
        filterStyle.backgroundColor = 'white'
    } else {
        filterStyle.backgroundColor = 'darkgray'
    }
    return (
        <>
            <h2 style={{ display: 'inline-block', marginBottom: '0' }}>Reported comments</h2>
            <input style={filterStyle} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter comments by content...'></input>
            <br />
            <div style={styleBox}>
                {comments.length === 0 ?
                    <div>No reported comments</div>
                    :
                    commentsToShow.map(comment =>
                        <Comment key={comment.id} comment={comment}></Comment>
                    )
                }
                <div ref={commentsEndRef} />
            </div>
        </>
    )
}

export default ReportedCommentsPage