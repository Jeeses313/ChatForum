import React from 'react'
import { Link } from 'react-router-dom'

const Chat = ({ chat }) => {
    let latestComment = 'No comments yet.'
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    let date = new Date(chat.date).toLocaleTimeString([], options)
    if (chat.latestComment) {
        if(chat.latestComment.content.length > 30) {
            latestComment = `${chat.latestComment.content.substring(0, 30)}... -${chat.latestComment.user.username}`
        } else {
            latestComment = `${chat.latestComment.content} -${chat.latestComment.user.username}`
        }
        date = new Date(chat.latestComment.date).toLocaleTimeString([], options)
    }
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '10px'
    }
    return (
        <div style={styleBox}>
            <div>
                <Link to={`/chats/${chat.title}`}>{chat.title}</Link>
            </div>
            <div>
                {latestComment}
            </div>
            <div>
                {date}
            </div>
        </div>
    )
}

export default Chat