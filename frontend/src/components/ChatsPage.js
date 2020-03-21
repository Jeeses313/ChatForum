import React, { useState, useEffect } from 'react'
import { useLazyQuery, useSubscription } from '@apollo/client'
import { CHAT_ADDED, CHATS } from '../queries/chatqueries'
import { COMMENT_ADDED } from '../queries/commentqueries'
import Chat from './Chat'
import ChatForm from './ChatForm'

const ChatsPage = () => {
    const [chats, setChats] = useState([])
    const [loadChats, chatsResult] = useLazyQuery(CHATS)
    useEffect(() => {
        loadChats()
    }, []) //eslint-disable-line
    useEffect(() => {
        if (chatsResult.data) {
            setChats(chatsResult.data.chats.sort((chatA, chatB) => {
                let dateA = chatA.date
                if (chatA.latestComment) {
                    dateA = chatA.latestComment.date
                }
                let dateB = chatB.date
                if (chatB.latestComment) {
                    dateB = chatB.latestComment.date
                }
                return dateB - dateA
            }))
        }
    }, [chatsResult.data])
    useSubscription(CHAT_ADDED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const newChat = subscriptionData.data.chatAdded
            const newChats = chats.concat(newChat)
            newChats.sort((chatA, chatB) => {
                let dateA = chatA.date
                if (chatA.latestComment) {
                    dateA = chatA.latestComment.date
                }
                let dateB = chatB.date
                if (chatB.latestComment) {
                    dateB = chatB.latestComment.date
                }
                return dateB - dateA
            })
            setChats(newChats)
        }
    })
    useSubscription(COMMENT_ADDED, {
        onSubscriptionData: ({ subscriptionData }) => {
            const newComment = subscriptionData.data.commentAdded.comment
            const chatTitle = subscriptionData.data.commentAdded.chatTitle
            const newChats = chats.map(chat => chat.title === chatTitle ? { ...chat, latestComment: newComment } : chat)
            newChats.sort((chatA, chatB) => {
                let dateA = chatA.date
                if (chatA.latestComment) {
                    dateA = chatA.latestComment.date
                }
                let dateB = chatB.date
                if (chatB.latestComment) {
                    dateB = chatB.latestComment.date
                }
                return dateB - dateA
            })
            setChats(newChats)
        }
    })
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
            <h2>Chats</h2>
            <div style={styleBox}>
                {chats.map(chat =>
                    <Chat key={chat.title} chat={chat}></Chat>
                )}
            </div>
            <ChatForm></ChatForm>
        </>
    )
}

export default ChatsPage