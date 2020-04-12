import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { DELETE_CHAT } from '../queries/chatqueries'
import { setNotification } from '../reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'

const Chat = ({ chat, isPinned, submitPin, submitUnpin }) => {
    const dispatch = useDispatch()
    const currentUser = useSelector(state => state.user)
    let latestComment = 'No comments yet.'
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    let date = new Date(chat.date).toLocaleTimeString([], options)
    if (chat.latestComment) {
        if (chat.latestComment.content.length > 30) {
            latestComment = `${chat.latestComment.content.substring(0, 30)}... -${chat.latestComment.user.username}`
        } else {
            latestComment = `${chat.latestComment.content} -${chat.latestComment.user.username}`
        }
        date = new Date(chat.latestComment.date).toLocaleTimeString([], options)
    }
    const [deleteChat, result] = useMutation(DELETE_CHAT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submitDelete = () => {
        if (window.confirm('Delete chat?')) {
            deleteChat({ variables: { chatId: chat.id } })
        }
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
                {date}&nbsp;
                {isPinned ?
                    <Button type='button' size='sm' onClick={() => submitUnpin(chat)}>Unpin</Button>
                    :
                    <Button type='button' size='sm' onClick={() => submitPin(chat)}>Pin</Button>
                }
                {currentUser.admin ?
                    <Button type='button' size='sm' onClick={submitDelete}>Delete</Button>
                    :
                    <></>
                }
            </div>
        </div>
    )
}

export default Chat