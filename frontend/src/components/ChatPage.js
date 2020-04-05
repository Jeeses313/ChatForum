import React from 'react'
import Chat from './Chat'
import { useRouteMatch } from 'react-router-dom'

const ChatPage = () => {
    const match = useRouteMatch('/chats/:title')
    const title = match ? match.params.title : null
    return (
        <>
            <h2 style={{ display: 'inline-block' }}>{title}</h2>
            <Chat title={title}></Chat>
        </>
    )
}

export default ChatPage