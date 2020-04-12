import React, { useState, useEffect, useCallback } from 'react'
import { useLazyQuery, useSubscription, useMutation } from '@apollo/client'
import { CHAT_ADDED, CHATS, PINNED_CHATS, CHAT_DELETED } from '../queries/chatqueries'
import { COMMENT_ADDED } from '../queries/commentqueries'
import Chat from './ChatListing'
import ChatForm from './ChatForm'
import { useDispatch } from 'react-redux'
import { UNPIN_CHAT, PIN_CHAT } from '../queries/chatqueries'
import { setNotification } from '../reducers/notificationReducer'

const ChatsPage = () => {
    const dispatch = useDispatch()
    const [chats, setChats] = useState([])
    const [loadChats, chatsResult] = useLazyQuery(CHATS)
    const [loadPinnedChats, pinnedChatsResult] = useLazyQuery(PINNED_CHATS)
    const [chatsToShow, setChatsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [pinnedChats, setPinnedChats] = useState()
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
        let dateA = chatA.date
        if (chatA.latestComment) {
            dateA = chatA.latestComment.date
        }
        let dateB = chatB.date
        if (chatB.latestComment) {
            dateB = chatB.latestComment.date
        }
        return dateB - dateA
    }, [pinnedChats])
    useEffect(() => {
        loadChats()
        loadPinnedChats()
    }, []) //eslint-disable-line
    useEffect(() => {
        if (chatsResult.data) {
            setChats(chatsResult.data.chats.slice(0).sort(sortChats))
            setChatsToShow(chats)
        }
    }, [chatsResult.data]) //eslint-disable-line
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
    useEffect(() => {
        if (filter === '') {
            setChatsToShow(chats.slice(0).sort(sortChats))
        } else {
            setChatsToShow(chats.filter(chat => chat.title.toLowerCase().startsWith(filter.toLowerCase())).sort(sortChats))
        }
    }, [filter, chats, sortChats])
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
        height: '77vh'
    }
    return (
        <div>
            <h2 style={{ display: 'inline-block', marginBottom: '0' }}>Chats</h2>
            <input style={{ float: 'right', width: '30%', paddingBottom: '0', position: 'relative', bottom: '-1.7vh' }} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter chats by title...'></input>
            <div style={styleBox}>
                {pinnedChats ?
                    <>
                        {chatsToShow.map(chat =>
                            <Chat key={chat.id} chat={chat} submitPin={submitPin} submitUnpin={submitUnpin} isPinned={pinnedChats.includes(chat.title)}></Chat>
                        )}
                    </>
                    :
                    <div>Loading</div>
                }

            </div>
            <ChatForm></ChatForm>
        </div>
    )
}

export default ChatsPage