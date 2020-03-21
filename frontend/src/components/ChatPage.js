import React, { useState, useEffect, useRef } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { COMMENT_ADDED, COMMENTS } from '../queries/commentqueries'
import Comment from './Comment'
import CommentForm from './CommentForm'

const ChatPage = () => {
    const [comments, setComments] = useState([])
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
            <h2>{title}</h2>
            <div style={styleBox}>
                {comments.length === 0 ?
                    <div>No comments yet</div>
                    :
                    comments.map(comment =>
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