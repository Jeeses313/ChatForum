import React, { useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { CREATE_COMMENT } from '../queries/commentqueries'
import { setNotification } from '../reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'

const CommentForm = ({ title }) => {
    const [content, setContent] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const dispatch = useDispatch()
    const mode = useSelector(state => state.mode)
    const [send, result] = useMutation(CREATE_COMMENT, { // eslint-disable-line
        onCompleted: () => {
            setContent('')
            setImageUrl('')
        },
        onError: (error) => {
            dispatch(setNotification({ message: error.graphQLErrors[0].message, error: true }, 10))
        }
    })
    const submit = (event) => {
        event.preventDefault()
        send({ variables: { chatTitle: title, content, imageUrl } })
    }
    const contentStyle = { resize: 'none', borderColor: 'grey' }
    const urlStyle = { borderColor: 'grey' }
    if (mode === 'light') {
        contentStyle.backgroundColor = 'white'
        urlStyle.backgroundColor = 'white'
    } else {
        contentStyle.backgroundColor = 'darkgray'
        urlStyle.backgroundColor = 'darkgray'
    }
    return (
        <div>
            <Form onSubmit={submit}>
                <Row size='lg'>
                    <Col md='10' style={{ paddingRight: '0' }}>
                        <Form.Control as='textarea' rows='2' style={contentStyle} id='content' value={content} name='content' onChange={({ target }) => setContent(target.value)} placeholder='New comment...' required block='true' />
                        <Form.Control style={urlStyle} size="sm" type="text" placeholder="Image/video url..." value={imageUrl} name='imageUrl' id='imageUrl' onChange={({ target }) => setImageUrl(target.value)} block='true'></Form.Control>
                    </Col>
                    <Col md='2' style={{ paddingLeft: '0' }}>
                        <Button style={{ height: '100%' }} id='submit' type='submit' size='lg' block>Send</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default CommentForm