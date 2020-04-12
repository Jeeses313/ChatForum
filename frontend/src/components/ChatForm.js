import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { CREATE_CHAT } from '../queries/chatqueries'
import { setNotification } from '../reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

const ChatForm = () => {
    const [title, setTitle] = useState('')
    const dispatch = useDispatch()
    const mode = useSelector(state => state.mode)
    const history = useHistory()
    const [create, result] = useMutation(CREATE_CHAT, { // eslint-disable-line
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submit = (event) => {
        event.preventDefault()
        create({ variables: { chatTitle: title } })
        setTitle('')
    }
    useEffect(() => {
        if (result.data) {
            dispatch(setNotification({ message: 'New chat created', error: false }, 10))
            history.push(`/chats/${result.data.createChat.title}`)
        }
    }, [result.data]) // eslint-disable-line
    const style = { resize: 'none', borderColor: 'grey' }
    if (mode === 'light') {
        style.backgroundColor = 'white'
    } else {
        style.backgroundColor = 'darkgray'
    }
    return (
        <>
            <Form onSubmit={submit}>
                <Row size="lg">
                    <Col md="10" style={{ paddingRight: '0' }}>
                        <Form.Control as="textarea" rows="1" style={style} id='content' value={title} name="content" onChange={({ target }) => setTitle(target.value)} placeholder='Title...' required block='true' />
                    </Col>
                    <Col md="2" style={{ paddingLeft: '0' }}>
                        <Button style={{ height: '100%' }} id='submit' type="submit" size="lg" block='true'>Start new chat</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default ChatForm