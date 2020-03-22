import React from 'react'

const Comment = ({ comment }) => {
    const styleBox = {
        borderStyle: 'solid',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '10px'
    }
    const contentBoxStyle = {
        width: '100%',
        resize: 'none',
        border: 'none'
    }
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    const date = new Date(comment.date).toLocaleTimeString([], options)
    return (
        <div style={styleBox}>
            <div>
                {comment.user.username} {date}
            </div>
            <textarea rows='2' value={comment.content} readOnly style={contentBoxStyle} block='true' />
        </div>
    )
}

export default Comment