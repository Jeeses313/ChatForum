import React from 'react'
import Navigationbar from './Navigationbar'
import ChatsPage from './ChatsPage'
import ChatPage from './ChatPage'
import ProfilePage from './ProfilePage'
import { Switch, Route, Redirect } from 'react-router-dom'
import ErrorPage from './ErrorPage'

const LoggedInPage = () => {
    return (
        <>
            <Navigationbar></Navigationbar>
            <div className='container' style={{ height: '100%' }}>
                <Switch>
                    <Route path='/error/:errormessage'>
                        <ErrorPage></ErrorPage>
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
            </div>
        </>
    )
}

export default LoggedInPage