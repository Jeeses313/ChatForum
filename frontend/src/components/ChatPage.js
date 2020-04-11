import React from 'react'
import Chat from './Chat'
import { useRouteMatch } from 'react-router-dom'

const ChatPage = () => {
    const match = useRouteMatch('/chats/:title')
    const title = match ? match.params.title : null
    return (
        <div>
            <h2 style={{ display: 'inline-block', marginBottom: '0' }}>{title}</h2>
            <Chat title={title}></Chat>
        </div>
    )
}

export default ChatPage