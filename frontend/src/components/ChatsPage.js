import React, { useState, useEffect } from 'react'
import { useLazyQuery, useSubscription, useMutation } from '@apollo/client'
import { CHAT_ADDED, CHATS } from '../queries/chatqueries'
import { COMMENT_ADDED } from '../queries/commentqueries'
import Chat from './Chat'
import ChatForm from './ChatForm'
import { useSelector, useDispatch } from 'react-redux'
import { UNPIN_CHAT, PIN_CHAT } from '../queries/chatqueries'
import { setNotification } from '../reducers/notificationReducer'
import { setUser } from '../reducers/userReducer'

const ChatsPage = () => {
    const dispatch = useDispatch()
    const [chats, setChats] = useState([])
    const [loadChats, chatsResult] = useLazyQuery(CHATS)
    const [chatsToShow, setChatsToShow] = useState([])
    const [filter, setFilter] = useState('')
    const [pinnedChats, setPinnedChats] = useState()
    const currentUser = useSelector(state => state.user)
    const sortChats = (chatA, chatB) => {
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
    }
    useEffect(() => {
        loadChats()
        setPinnedChats(currentUser.pinnedChats.map(chat => chat.title))
    }, []) //eslint-disable-line
    useEffect(() => {
        if (chatsResult.data) {
            setChats(chatsResult.data.chats.sort(sortChats))
            setChatsToShow(chats)
        }
    }, [chatsResult.data]) //eslint-disable-line
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
            setChatsToShow(chats)
        } else {
            setChatsToShow(chats.filter(chat => chat.title.toLowerCase().startsWith(filter.toLowerCase())))
        }
    }, [filter, chats])
    useEffect(() => {
        setChats(chats.sort(sortChats))
    }, [pinnedChats]) //eslint-disable-line
    //alku
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
    useEffect(() => {
        dispatch(setUser({ ...currentUser, pinnedChats: pinnedChats }))
    }, [pinnedChats]) // eslint-disable-line
    //loppu
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        borderColor: 'grey',
        padding: '10px',
        marginBottom: '10px',
        overflowY: 'scroll',
        height: '75vh'
    }
    return (
        <>
            <h2 style={{ display: 'inline-block' }}>Chats</h2>
            <input style={{ float: 'right', bottom: '0%', width: '30%' }} type='text' value={filter} onChange={({ target }) => setFilter(target.value)} placeholder='Filter chats by title...'></input>
            <div style={styleBox}>
                {chatsToShow.map(chat =>
                    <Chat key={chat.id} chat={chat} submitPin={submitPin} submitUnpin={submitUnpin} isPinned={pinnedChats.includes(chat.title)}></Chat>
                )}
            </div>
            <ChatForm></ChatForm>
        </>
    )
}

export default ChatsPage