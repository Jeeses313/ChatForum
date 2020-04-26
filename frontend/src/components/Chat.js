import React, { useState, useEffect, useRef } from 'react'
import { useLazyQuery, useSubscription, useMutation } from '@apollo/client'
import { COMMENT_ADDED, COMMENT_DELETED, COMMENT_EDITED, COMMENT_REPORTED } from '../queries/commentqueries'
import { CHAT, CHAT_REPORTED, REPORT_CHAT, UNREPORT_CHAT, ZEROREPORT_CHAT, PINNED_CHATS, PIN_CHAT, UNPIN_CHAT } from '../queries/chatqueries'
import Comment from './Comment'
import CommentForm from './CommentForm'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Row, Col } from 'react-bootstrap'
import { setNotification } from '../reducers/notificationReducer'

const Chat = ({ title }) => {
    const [chat, setChat] = useState(null)
    const [comments, setComments] = useState([])
    const history = useHistory()
    const dispatch = useDispatch()
    const mode = useSelector(state => state.mode)
    const currentUser = useSelector(state => state.user)
    const [commentsToShow, setCommentsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [loadChat, chatResult] = useLazyQuery(CHAT)
    const [loadPinnedChats, pinnedChatsResult] = useLazyQuery(PINNED_CHATS)
    const [pinnedChats, setPinnedChats] = useState()
    const commentsEndRef = useRef(null)
    const scrollToBottom = () => {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    useEffect(() => {
        loadChat({ variables: { chatTitle: title } })
        loadPinnedChats()
    }, []) //eslint-disable-line
    useEffect(() => {
        loadChat({ variables: { chatTitle: title } })
        loadPinnedChats()
    }, [title]) //eslint-disable-line
    useEffect(() => {
        if (chatResult.data) {
            setComments(chatResult.data.chat.comments.sort((commentA, commentB) => {
                return commentA.date - commentB.date
            }))
            setChat(chatResult.data.chat)
        } else if (chatResult.called && !chatResult.loading) {
            history.push('/error/Chat does not exist')
        }
    }, [chatResult]) //eslint-disable-line
    useEffect(() => {
        if (pinnedChatsResult.data) {
            setPinnedChats(pinnedChatsResult.data.pinnedChats.map(chat => chat.title))
        }
    }, [pinnedChatsResult.data]) //eslint-disable-line
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
            setComments(comments.map(comment => comment.id === deletedComment.id ? { ...comment, content: deletedComment.content, imageUrl: deletedComment.imageUrl, reports: deletedComment.reports } : comment))
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
    const [reportChat, reportResult] = useMutation(REPORT_CHAT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitReport = () => {
        if (window.confirm('Report chat?')) {
            reportChat({ variables: { chatTitle: title } })
        }
    }
    useEffect(() => {
        if (reportResult.data) {
            dispatch(setNotification({ message: 'Chat reported', error: false }, 10))
        }
    }, [reportResult.data]) // eslint-disable-line
    const [unreportChat, unreportResult] = useMutation(UNREPORT_CHAT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitUnreport = () => {
        if (window.confirm('Unreport chat?')) {
            unreportChat({ variables: { chatTitle: title } })
        }
    }
    useEffect(() => {
        if (unreportResult.data) {
            dispatch(setNotification({ message: 'Chat unreported', error: false }, 10))
        }
    }, [unreportResult.data]) // eslint-disable-line
    const [zeroReportChat, zeroReportResult] = useMutation(ZEROREPORT_CHAT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitZeroReport = () => {
        if (window.confirm('Zero chat\'s reports?')) {
            zeroReportChat({ variables: { chatTitle: title } })
        }
    }
    useEffect(() => {
        if (zeroReportResult.data) {
            dispatch(setNotification({ message: 'Chat\'s reports zeroed', error: false }, 10))
        }
    }, [zeroReportResult.data]) // eslint-disable-line
    useSubscription(CHAT_REPORTED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const reportedChat = subscriptionData.data.chatReported
            if (reportedChat.title === title) {
                setChat(reportedChat)
            }
        }
    })
    const [pinChat, pinResult] = useMutation(PIN_CHAT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const [unpinChat, unpinResult] = useMutation(UNPIN_CHAT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitPin = () => {
        if (window.confirm('Pin chat?')) {
            pinChat({ variables: { chatTitle: title } })
        }
    }
    useEffect(() => {
        if (pinResult.data) {
            setPinnedChats(pinnedChats.concat(pinResult.data.pinChat.title))
            dispatch(setNotification({ message: 'Chat pinned', error: false }, 10))
        }
    }, [pinResult.data]) // eslint-disable-line
    const submitUnpin = () => {
        if (window.confirm('Unpin chat?')) {
            unpinChat({ variables: { chatTitle: title } })
        }
    }
    useEffect(() => {
        if (unpinResult.data) {
            setPinnedChats(pinnedChats.filter(pchat => pchat !== unpinResult.data.unpinChat.title))
            dispatch(setNotification({ message: 'Chat unpinned', error: false }, 10))
        }
    }, [unpinResult.data]) // eslint-disable-line
    useSubscription(COMMENT_REPORTED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const reportedComment = subscriptionData.data.commentReported
            const newComments = comments.map(comment => comment.id === reportedComment.id ? { ...comment, reports: reportedComment.reports } : comment)
            setComments(newComments)
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
        width: '100%',
    }
    const filterStyle = { width: '100%', paddingBottom: '0', borderColor: 'grey', paddingRight: '0', paddingLeft: '0' }
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
                    {title.startsWith('userChat') ?
                        <h2 style={{ display: 'inline-block', marginBottom: '0' }}>{`${title.substring(8)}'s chat`}</h2>
                        :
                        <h2 style={{ display: 'inline-block', marginBottom: '0' }}>
                            {title}&nbsp;
                            {pinnedChats && pinnedChats.includes(title) ?
                                <Button type='button' size='sm' onClick={submitUnpin}>Unpin</Button>
                                :
                                <Button type='button' size='sm' onClick={submitPin}>Pin</Button>
                            }
                            {currentUser.admin ?
                                <>
                                    {chat && chat.reports.length > 0 ?
                                        <>
                                            <Button type='button' size='sm' onClick={submitZeroReport}>Zero reports</Button> <span style={{ fontSize: '1rem' }}> Reports: {chat.reports.length}</span>
                                        </>
                                        :
                                        <></>
                                    }
                                </>
                                :
                                <>
                                    {chat && chat.reports && chat.reports.includes(currentUser.id) ?
                                        <Button type='button' size='sm' onClick={submitUnreport}>Unreport</Button>
                                        :
                                        <Button type='button' size='sm' onClick={submitReport}>Report</Button>
                                    }
                                </>
                            }
                        </h2>
                    }
                </Col>
                <Col md="4" style={colStyle}>
                    <input style={filterStyle} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter comments by content...'></input>
                </Col>
            </Row>
            <Row >
                <Col style={colStyle}>
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
                </Col>
            </Row>
            <CommentForm title={title}></CommentForm>
        </>
    )
}

export default Chat