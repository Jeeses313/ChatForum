import React from 'react'
import Chat from './Chat'
import { useRouteMatch } from 'react-router-dom'

const ChatPage = () => {
    const match = useRouteMatch('/chats/:title')
    const title = match ? match.params.title : null
    return (
        <div>
            <Chat title={title}></Chat>
        </div>
    )
}

export default ChatPage