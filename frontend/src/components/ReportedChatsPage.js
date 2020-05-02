import React, { useState, useEffect, useCallback } from 'react'
import { useLazyQuery, useSubscription, useMutation } from '@apollo/client'
import { CHAT_ADDED, REPORTED_CHATS, PINNED_CHATS, CHAT_DELETED, UNPIN_CHAT, PIN_CHAT, CHAT_REPORTED } from '../queries/chatqueries'
import { COMMENT_ADDED } from '../queries/commentqueries'
import ChatListing from './ChatListing'
import { useDispatch, useSelector } from 'react-redux'
import { setNotification } from '../reducers/notificationReducer'
import { useHistory } from 'react-router-dom'
import { Row, Col, Button } from 'react-bootstrap'

const ReportedChatsPage = () => {
    const dispatch = useDispatch()
    const mode = useSelector(state => state.mode)
    const currentUser = useSelector(state => state.user)
    const history = useHistory()
    const [chats, setChats] = useState([])
    const [loadReportedChats, reportedChatsResult] = useLazyQuery(REPORTED_CHATS)
    const [loadPinnedChats, pinnedChatsResult] = useLazyQuery(PINNED_CHATS)
    const [chatsToShow, setChatsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [pinnedChats, setPinnedChats] = useState()
    const [onlyPinned, setOnlyPinned] = useState(false)
    const [sorByTitle, setSorByTitle] = useState(false)
    const sortChats = useCallback((chatA, chatB) => {
        if (!pinnedChats) {
            return 0
        }
        if (pinnedChats.includes(chatA.title) && !pinnedChats.includes(chatB.title)) {
            return -1
        }
        if (!pinnedChats.includes(chatA.title) && pinnedChats.includes(chatB.title)) {
            return 1
        }
        if (chatA.reports.length !== chatB.reports.length) {
            return chatB.reports.length - chatA.reports.length
        }
        if (sorByTitle) {
            return chatA.title.localeCompare(chatB.title)
        } else {
            let dateA = chatA.date
            if (chatA.latestComment) {
                dateA = chatA.latestComment.date
            }
            let dateB = chatB.date
            if (chatB.latestComment) {
                dateB = chatB.latestComment.date
            }
            return dateB - dateA
        }
    }, [pinnedChats, sorByTitle])
    useEffect(() => {
        if (!currentUser.admin) {
            history.push('/error/Not authorized')
        }
        loadReportedChats()
        loadPinnedChats()
    }, []) //eslint-disable-line
    useEffect(() => {
        if (reportedChatsResult.data) {
            setChats(reportedChatsResult.data.reportedChats.slice(0).sort(sortChats))
            setChatsToShow(chats)
        }
    }, [reportedChatsResult.data]) //eslint-disable-line
    useEffect(() => {
        if (pinnedChatsResult.data) {
            setPinnedChats(pinnedChatsResult.data.pinnedChats.map(chat => chat.title))
        }
    }, [pinnedChatsResult.data]) //eslint-disable-line
    useSubscription(CHAT_ADDED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const newChat = subscriptionData.data.chatAdded
            const newChats = chats.concat(newChat)
            newChats.sort(sortChats)
            setChats(newChats)
        }
    })
    useSubscription(COMMENT_ADDED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const newComment = subscriptionData.data.commentAdded.comment
            const chatTitle = subscriptionData.data.commentAdded.chatTitle
            const newChats = chats.map(chat => chat.title === chatTitle ? { ...chat, latestComment: newComment } : chat)
            newChats.sort(sortChats)
            setChats(newChats)
        }
    })
    useSubscription(CHAT_REPORTED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const reportedChat = subscriptionData.data.chatReported
            let newChats = []
            if (chats.map(chat => chat.title).includes(reportedChat.title)) {
                newChats = chats.map(chat => chat.title === reportedChat.title ? { ...chat, reports: reportedChat.reports } : chat)
            } else {
                newChats = chats.concat(reportedChat)
            }
            newChats.sort(sortChats)
            setChats(newChats.filter(chat => chat.reports.length > 0))
        }
    })
    useEffect(() => {
        if (filter === '') {
            if (onlyPinned) {
                setChatsToShow(chats.filter(chatp => pinnedChats.includes(chatp.title)).sort(sortChats))
            } else {
                setChatsToShow(chats.slice(0).sort(sortChats))
            }
        } else {
            if (onlyPinned) {
                setChatsToShow(chats.filter(chatp => pinnedChats.includes(chatp.title)).filter(chat => chat.title.toLowerCase().startsWith(filter.toLowerCase())).sort(sortChats))
            } else {
                setChatsToShow(chats.filter(chat => chat.title.toLowerCase().startsWith(filter.toLowerCase())).sort(sortChats))
            }
        }
    }, [filter, chats, sortChats, onlyPinned, pinnedChats, sorByTitle])
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
    const submitPin = (chat) => {
        if (window.confirm('Pin chat?')) {
            pinChat({ variables: { chatTitle: chat.title } })
        }
    }
    useEffect(() => {
        if (pinResult.data) {
            setPinnedChats(pinnedChats.concat(pinResult.data.pinChat.title))
            dispatch(setNotification({ message: 'Chat pinned', error: false }, 10))
        }
    }, [pinResult.data]) // eslint-disable-line
    const submitUnpin = (chat) => {
        if (window.confirm('Unpin chat?')) {
            unpinChat({ variables: { chatTitle: chat.title } })
        }
    }
    useEffect(() => {
        if (unpinResult.data) {
            setPinnedChats(pinnedChats.filter(pchat => pchat !== unpinResult.data.unpinChat.title))
            dispatch(setNotification({ message: 'Chat unpinned', error: false }, 10))
        }
    }, [unpinResult.data]) // eslint-disable-line
    useSubscription(CHAT_DELETED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const deletedChat = subscriptionData.data.chatDeleted
            setChats(chats.filter(chat => chat.id !== deletedChat.id))
        }
    })
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        borderColor: 'grey',
        padding: '10px',
        marginBottom: '0',
        overflowY: 'scroll',
        height: '77.5vh'
    }
    const filterStyle = { width: '100%', paddingBottom: '0', borderColor: 'grey' }
    if (mode === 'light') {
        filterStyle.backgroundColor = 'white'
    } else {
        filterStyle.backgroundColor = 'darkgray'
    }
    const colStyle = { paddingRight: '0', paddingLeft: '0' }
    return (
        <div style={{ height: '100%' }}>
            <Row>
                <Col md="8" style={colStyle}>
                    <h2 style={{ display: 'inline-block', marginBottom: '0' }}>
                        Reported chats&nbsp;
                        {sorByTitle ?
                            <Button type='button' size='sm' onClick={() => setSorByTitle(false)}>Sort by: title</Button>
                            :
                            <Button type='button' size='sm' onClick={() => setSorByTitle(true)}>Sort by: activity</Button>
                        }
                        {onlyPinned ?
                            <Button type='button' size='sm' onClick={() => setOnlyPinned(false)}>Show: pinned</Button>
                            :
                            <Button type='button' size='sm' onClick={() => setOnlyPinned(true)}>Show: all</Button>
                        }
                    </h2>
                </Col>
                <Col md="4" style={colStyle}>
                    <input style={filterStyle} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter chats by title...'></input>
                </Col>
            </Row >
            <Row>
                <Col style={colStyle}>
                    <div style={styleBox}>
                        {pinnedChats ?
                            <>
                                {chats.length !== 0 ?
                                    <>
                                        {chatsToShow.map(chat =>
                                            <ChatListing key={chat.id} chat={chat} submitPin={submitPin} submitUnpin={submitUnpin} isPinned={pinnedChats.includes(chat.title)}></ChatListing>
                                        )}
                                    </>
                                    :
                                    <div>No reported chats</div>
                                }
                            </>
                            :
                            <div>Loading</div>
                        }
                    </div>
                </Col>
            </Row >
        </div >
    )
}

export default ReportedChatsPage