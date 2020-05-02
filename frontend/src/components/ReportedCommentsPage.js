import React, { useState, useEffect, useRef } from 'react'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { COMMENT_DELETED, COMMENT_EDITED, COMMENT_REPORTED, REPORTED_COMMENTS } from '../queries/commentqueries'
import Comment from './Comment'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Row, Col } from 'react-bootstrap'

const ReportedCommentsPage = () => {
    const [comments, setComments] = useState([])
    const history = useHistory()
    const mode = useSelector(state => state.mode)
    const currentUser = useSelector(state => state.user)
    const [commentsToShow, setCommentsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [loadComments, commentsResult] = useLazyQuery(REPORTED_COMMENTS)
    const commentsEndRef = useRef(null)
    const [toScroll, setToScroll] = useState(true)
    const sortComments = (commentA, commentB) => {
        if (commentA.reports.length !== commentB.reports.length) {
            return commentB.reports.length - commentA.reports.length
        }
        return commentA.date - commentB.date
    }
    const scrollToBottom = () => {
        if (commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }
    useEffect(() => {
        if (!currentUser.admin) {
            history.push('/error/Not authorized')
        }
        console.log('oi')
        loadComments()
    }, []) //eslint-disable-line
    useEffect(() => {
        console.log(commentsResult)
        if (commentsResult.data) {
            console.log(commentsResult.data)
            setToScroll(true)
            setComments(commentsResult.data.reportedComments.sort(sortComments))
            setTimeout(() => {
                scrollToBottom()
            }, 200)
            setTimeout(() => {
                scrollToBottom()
            }, 300)
        }
    }, [commentsResult]) //eslint-disable-line
    useEffect(() => {
        if (toScroll) {
            scrollToBottom()
            setToScroll(false)
        }
    }, [commentsToShow]) //eslint-disable-line
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
        height: '77.5vh',
        width: '100%'
    }
    const filterStyle = { width: '100%', paddingBottom: '0', borderColor: 'grey' }
    if (mode === 'light') {
        filterStyle.backgroundColor = 'white'
    } else {
        filterStyle.backgroundColor = 'darkgray'
    }
    const colStyle = { paddingRight: '0', paddingLeft: '0' }
    return (
        <>
            <Row>
                <Col md="8" style={colStyle}>
                    <h2 style={{ display: 'inline-block', marginBottom: '0' }}>Reported comments</h2>
                </Col>
                <Col md="4" style={colStyle}>
                    <input style={filterStyle} type='text' value={filter} onChange={({ target }) => {
                        setToScroll(true)
                        setFilter(target.value)
                    }} placeholder='Filter comments by content...'></input>
                </Col>
            </Row>
            <Row >
                <Col style={colStyle}>
                    <div style={styleBox}>
                        {comments.length === 0 ?
                            <div>No reported comments</div>
                            :
                            <>
                                {commentsToShow.map(comment =>
                                    <Comment key={comment.id} comment={comment}></Comment>
                                )}
                            </>
                        }
                        <div ref={commentsEndRef} />
                    </div>
                </Col>
            </Row>
        </>
    )
}

export default ReportedCommentsPage