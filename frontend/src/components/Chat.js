import React, { useState, useEffect, useRef } from 'react'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { COMMENT_ADDED, COMMENTS, COMMENT_DELETED, COMMENT_EDITED } from '../queries/commentqueries'
import Comment from './Comment'
import CommentForm from './CommentForm'
import { useHistory } from 'react-router-dom'

const Chat = ({ title }) => {
    const [comments, setComments] = useState([])
    const history = useHistory()
    const [commentsToShow, setCommentsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [loadComments, commentsResult] = useLazyQuery(COMMENTS)
    const commentsEndRef = useRef(null)
    const scrollToBottom = () => {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    useEffect(() => {
        loadComments({ variables: { chatTitle: title } })
    }, []) //eslint-disable-line
    useEffect(() => {
        loadComments({ variables: { chatTitle: title } })
    }, [title]) //eslint-disable-line
    useEffect(() => {
        if (commentsResult.data) {
            setComments(commentsResult.data.comments.sort((commentA, commentB) => {
                return commentA.date - commentB.date
            }))
        } else if (commentsResult.called && !commentsResult.loading) {
            history.push('/error/Chat does not exist')
        }
    }, [commentsResult]) //eslint-disable-line
    useEffect(scrollToBottom, [comments, commentsToShow])
    useSubscription(COMMENT_ADDED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const newComment = subscriptionData.data.commentAdded.comment
            const chatTitle = subscriptionData.data.commentAdded.chatTitle
            if (chatTitle === title) {
                const newComments = comments.concat(newComment)
                newComments.sort((commentA, commentB) => {
                    return commentA.date - commentB.date
                })
                setComments(newComments)
            }
        }
    })
    useSubscription(COMMENT_DELETED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const deletedComment = subscriptionData.data.commentDeleted
            setComments(comments.map(comment => comment.id === deletedComment.id ? { ...comment, content: deletedComment.content, imageUrl: deletedComment.imageUrl } : comment))
        }
    })
    useSubscription(COMMENT_EDITED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const editedComment = subscriptionData.data.commentEdited
            setComments(comments.map(comment => comment.id === editedComment.id ? { ...comment, content: editedComment.content } : comment))
        }
    })
    useEffect(() => {
        if (filter === '') {
            setCommentsToShow(comments)
        } else {
            setCommentsToShow(comments.filter(comment => comment.content.toLowerCase().includes(filter.toLowerCase())))
        }
    }, [filter, comments])
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        borderColor: 'grey',
        padding: '10px',
        marginBottom: '10px',
        overflowY: 'scroll',
        height: '67vh'
    }
    return (
        <>
            <input style={{ float: 'right', bottom: '0%', width: '30%' }} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter comments by content...'></input>
            <br/>
            <div style={styleBox}>
                {comments.length === 0 ?
                    <div>No comments yet</div>
                    :
                    commentsToShow.map(comment =>
                        <Comment key={comment.id} comment={comment}></Comment>
                    )
                }
                <div ref={commentsEndRef} />
            </div>
            <CommentForm title={title}></CommentForm>
        </>
    )
}

export default Chat