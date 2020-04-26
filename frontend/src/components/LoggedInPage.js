import React from 'react'
import ChatsPage from './ChatsPage'
import ReportedChatsPage from './ReportedChatsPage'
import ReportedCommentsPage from './ReportedCommentsPage'
import ChatPage from './ChatPage'
import ProfilePage from './ProfilePage'
import { Switch, Route, Redirect } from 'react-router-dom'
import ErrorPage from './ErrorPage'
import { Container } from 'react-bootstrap'

const LoggedInPage = () => {
    return (
        <Container style={{ height: '100%' }}>
            <Switch>
                <Route path='/error/:errormessage'>
                    <ErrorPage></ErrorPage>
                </Route>
                <Route path='/reported/chats'>
                    <ReportedChatsPage></ReportedChatsPage>
                </Route>
                <Route path='/reported/comments'>
                    <ReportedCommentsPage></ReportedCommentsPage>
                </Route>
                <Route path='/chats/:title'>
                    <ChatPage></ChatPage>
                </Route>
                <Route path='/chats'>
                    <ChatsPage></ChatsPage>
                </Route>
                <Route path='/users/:username'>
                    <ProfilePage></ProfilePage>
                </Route>
                <Route path='/'>
                    <Redirect to='/chats'></Redirect>
                </Route>
            </Switch>
        </Container>
    )
}

export default LoggedInPage