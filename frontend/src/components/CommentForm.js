import React, { useState } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { CREATE_COMMENT } from '../queries/commentqueries'
import { setNotification } from '../reducers/notificationReducer'
import { useDispatch } from 'react-redux'

const CommentForm = ({ title }) => {
    const [content, setContent] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const dispatch = useDispatch()
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
    return (
        <>
            <Form onSubmit={submit}>
                <Row size='lg'>
                    <Col md='10'>
                        <Form.Control as='textarea' rows='2' style={{ resize: 'none' }} id='content' value={content} name='content' onChange={({ target }) => setContent(target.value)} placeholder='New comment...' required block='true' />
                    </Col>
                    <Col md='2'>
                        <Button id='submit' type='submit' size='lg' block>Send</Button>
                    </Col>
                </Row>
                <Row size='lg'>
                    <Col md='10'>
                        <Form.Control size="sm" type="text" placeholder="Image url..." value={imageUrl} name='imageUrl' id='imageUrl' onChange={({ target }) => setImageUrl(target.value)}></Form.Control>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

export default CommentForm