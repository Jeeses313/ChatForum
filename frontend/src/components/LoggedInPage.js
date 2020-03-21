import React from 'react'
import Navigationbar from './Navigationbar'
import ChatsPage from './ChatsPage'
import ChatPage from './ChatPage'
import { Switch, Route } from 'react-router-dom'

const LoggedInPage = () => {

    return (
        <>
            <Navigationbar></Navigationbar>
            <div className='container'>
                <Switch>
                    <Route path='/chats/:title'>
                        <ChatPage></ChatPage>
                    </Route>
                    <Route path='/chats'>
                        <ChatsPage></ChatsPage>
                    </Route>
                    <Route path='/'>
                        <h1>Welcome</h1>
                    </Route>
                </Switch>
            </div>
        </>
    )
}

export default LoggedInPage