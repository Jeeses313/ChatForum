import React, { useState, useEffect, useRef } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { COMMENT_ADDED, COMMENTS, COMMENT_DELETED, COMMENT_EDITED } from '../queries/commentqueries'
import Comment from './Comment'
import CommentForm from './CommentForm'

const ChatPage = () => {
    const [comments, setComments] = useState([])
    const [commentsToShow, setCommentsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [loadComments, commentsResult] = useLazyQuery(COMMENTS)
    const match = useRouteMatch('/chats/:title')
    const title = match ? match.params.title : null
    const commentsEndRef = useRef(null)
    const scrollToBottom = () => {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    useEffect(() => {
        loadComments({ variables: { chatTitle: title } })
    }, []) //eslint-disable-line
    useEffect(() => {
        if (commentsResult.data) {
            setComments(commentsResult.data.comments.sort((commentA, commentB) => {
                return commentA.date - commentB.date
            }))
        }
    }, [commentsResult.data])
    useEffect(() => {
        scrollToBottom()
    }, [comments])
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
            setComments(comments.map(comment => comment.id === deletedComment.id ? { ...comment, content: deletedComment.content } : comment))
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
        height: '70vh'
    }

    return (
        <>
            <h2 style={{ display: 'inline-block' }}>{title}</h2>
            <input style={{ float: 'right', bottom: '0%', width: '30%' }} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter comments by content...'></input>
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

export default ChatPage