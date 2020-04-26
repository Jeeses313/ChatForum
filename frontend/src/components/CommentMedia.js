import React, { useState } from 'react'
import '../style.css'
import { Image, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { setNotification } from '../reducers/notificationReducer'

const CommentMedia = ({ imageUrl, hasVideo }) => {
    const dispatch = useDispatch()
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    const handleShow = () => {
        setShow(true)
        dispatch(setNotification(''))
    }
    if (imageUrl && imageUrl !== '') {
        if (hasVideo) {
            return (
                <>
                    <iframe width="420" height="315"
                        frameBorder='0'
                        allowFullScreen
                        title='video'
                        src={imageUrl}>
                    </iframe>
                    <br />
                </>
            )
        } else {
            return (
                <>
                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={
                        <Tooltip>Click to expand</Tooltip>
                    }>
                        <Image src={imageUrl} onClick={handleShow} style={{maxWidth: '30%', maxHeight: '30%'}}></Image>
                    </OverlayTrigger>
                    <Modal show={show} size="lg" onHide={handleClose} >
                        <Modal.Header closeButton></Modal.Header>
                        <Modal.Body style={{ alignItems: 'center', padding: '0', position: 'absolute', maxWidth: 'max-content', height: 'auto', display: 'block' }} >
                            <Image src={imageUrl} style={{ maxWidth: 'max-content', height: 'auto', display: 'block' }} fluid ></Image >
                        </Modal.Body>
                    </Modal>
                    <br />
                </>
            )
        }
    } else {
        return (
            <></>
        )
    }
}

export default CommentMedia